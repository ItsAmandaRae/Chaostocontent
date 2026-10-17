CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,role public.app_role NOT NULL,UNIQUE(user_id,role));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
CREATE POLICY own_role_read ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE TABLE public.billing_entitlements(user_id uuid PRIMARY KEY,provider text NOT NULL,provider_customer_id text,provider_subscription_id text UNIQUE,status text NOT NULL DEFAULT 'inactive',valid_until timestamptz,verified_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.billing_entitlements TO service_role; ALTER TABLE public.billing_entitlements ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.complimentary_grants(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL,created_by uuid NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz,revoked_at timestamptz,revoked_by uuid);
GRANT ALL ON public.complimentary_grants TO service_role; ALTER TABLE public.complimentary_grants ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.access_audit(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),recipient_id uuid NOT NULL,actor_id uuid NOT NULL,action text NOT NULL,grant_id uuid,created_at timestamptz NOT NULL DEFAULT now(),details jsonb NOT NULL DEFAULT '{}');
GRANT ALL ON public.access_audit TO service_role; ALTER TABLE public.access_audit ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.ai_usage(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL,request_id uuid NOT NULL,action text NOT NULL,kind text NOT NULL,source_key text NOT NULL,payload_hash text NOT NULL,period date NOT NULL,state text NOT NULL DEFAULT 'reserved',reserved_until timestamptz NOT NULL DEFAULT now()+interval '10 minutes',result jsonb,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,request_id));
GRANT ALL ON public.ai_usage TO service_role; ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE INDEX ai_usage_period ON public.ai_usage(user_id,period,kind,state);
CREATE FUNCTION public.plan_config(p_paid boolean) RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$ SELECT jsonb_build_object('creations',CASE WHEN p_paid THEN 100 ELSE 5 END,'media_reads',CASE WHEN p_paid THEN 100 ELSE 5 END,'buckets',CASE WHEN p_paid THEN null ELSE 3 END,'paid_allowance_provisional',true,'price_pending',true) $$;
CREATE FUNCTION public.month_period(p_at timestamptz) RETURNS date LANGUAGE sql IMMUTABLE AS $$ SELECT date_trunc('month',p_at AT TIME ZONE 'UTC')::date $$;
CREATE FUNCTION public.access_for(p_user uuid,p_at timestamptz DEFAULT now()) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ DECLARE billed boolean; gifted boolean; expiry timestamptz; cfg jsonb; c int; m int; BEGIN
SELECT EXISTS(SELECT 1 FROM billing_entitlements WHERE user_id=p_user AND status='active' AND valid_until>p_at) INTO billed;
SELECT EXISTS(SELECT 1 FROM complimentary_grants WHERE user_id=p_user AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>p_at)) INTO gifted;
SELECT max(expires_at) INTO expiry FROM complimentary_grants WHERE user_id=p_user AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at>p_at);
IF EXISTS(SELECT 1 FROM complimentary_grants WHERE user_id=p_user AND revoked_at IS NULL AND expires_at IS NULL) THEN expiry:=null; END IF;
cfg:=plan_config(billed OR gifted);
SELECT count(*) FILTER(WHERE kind='creation'),count(*) FILTER(WHERE kind='media') INTO c,m FROM ai_usage WHERE user_id=p_user AND period=month_period(p_at) AND (state='succeeded' OR (state='reserved' AND reserved_until>p_at));
RETURN cfg || jsonb_build_object('plan',CASE WHEN billed THEN 'Paid' WHEN gifted THEN 'Complimentary' ELSE 'Free' END,'paid',billed OR gifted,'billing_active',billed,'expires_at',CASE WHEN gifted AND NOT billed THEN expiry ELSE null END,'creations_remaining',greatest(0,(cfg->>'creations')::int-c),'media_remaining',greatest(0,(cfg->>'media_reads')::int-m),'reset_at',(month_period(p_at)+interval '1 month') AT TIME ZONE 'UTC'); END $$;
REVOKE ALL ON FUNCTION public.access_for(uuid,timestamptz) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.access_for(uuid,timestamptz) TO service_role;
CREATE FUNCTION public.my_access() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF; RETURN access_for(auth.uid()) || jsonb_build_object('admin',has_role(auth.uid(),'admin')); END $$;
REVOKE ALL ON FUNCTION public.my_access() FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.my_access() TO authenticated;
CREATE FUNCTION public.reserve_ai(p_user uuid,p_request uuid,p_action text,p_kind text,p_source text,p_hash text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE prev ai_usage; a jsonb; BEGIN
PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
SELECT * INTO prev FROM ai_usage WHERE user_id=p_user AND request_id=p_request;
IF FOUND THEN
 IF prev.payload_hash<>p_hash OR prev.action<>p_action OR prev.source_key<>p_source THEN RAISE EXCEPTION 'Request ID was already used for another action'; END IF;
 IF prev.state='succeeded' THEN RETURN jsonb_build_object('cached',true,'result',prev.result); END IF;
 IF prev.state='reserved' AND prev.reserved_until>now() THEN RAISE EXCEPTION 'This action is already in progress'; END IF;
 RAISE EXCEPTION 'That request ended. Retry with a new request ID';
END IF;
a:=access_for(p_user);
IF p_kind NOT IN ('creation','media') THEN RAISE EXCEPTION 'Invalid allowance'; END IF;
IF (CASE WHEN p_kind='creation' THEN (a->>'creations_remaining')::int ELSE (a->>'media_remaining')::int END)<=0 THEN RAISE EXCEPTION 'Monthly allowance used. Original material and saved content remain available'; END IF;
IF p_kind='media' AND EXISTS(SELECT 1 FROM ai_usage WHERE user_id=p_user AND kind='media' AND source_key=p_source AND state='reserved' AND reserved_until>now()) THEN RAISE EXCEPTION 'This source is already being read'; END IF;
INSERT INTO ai_usage(user_id,request_id,action,kind,source_key,payload_hash,period) VALUES(p_user,p_request,p_action,p_kind,p_source,p_hash,month_period(now()));
RETURN jsonb_build_object('cached',false); END $$;
CREATE FUNCTION public.finish_ai(p_user uuid,p_request uuid,p_success boolean,p_result jsonb DEFAULT null) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r ai_usage; post_id uuid; BEGIN
PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
SELECT * INTO r FROM ai_usage WHERE user_id=p_user AND request_id=p_request FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Reservation missing'; END IF;
IF r.state='succeeded' THEN RETURN r.result; END IF;
IF r.state<>'reserved' OR r.reserved_until<=now() THEN RAISE EXCEPTION 'Reservation ended'; END IF;
IF NOT p_success THEN UPDATE ai_usage SET state='failed' WHERE id=r.id; RETURN null; END IF;
IF r.action='create' THEN
 INSERT INTO posts(user_id,dump_id,idea_id,platform,variant,title,content,char_count,status,prompt_notes,voice_mode,reference_note,source_snapshot)
 VALUES(p_user,(p_result->>'dump_id')::uuid,(p_result->>'idea_id')::uuid,p_result->>'platform',p_result->>'variant',p_result->>'title',p_result->>'content',length(p_result->>'content'),'draft',p_result->>'prompt_notes',p_result->>'voice_mode',p_result->>'reference_note',p_result->>'source_snapshot') RETURNING id INTO post_id;
 p_result:=jsonb_build_object('ok',true,'posts',jsonb_build_array(jsonb_build_object('id',post_id,'platform',p_result->>'platform','content',p_result->>'content')));
END IF;
UPDATE ai_usage SET state='succeeded',result=p_result WHERE id=r.id; RETURN p_result; END $$;
REVOKE ALL ON FUNCTION public.reserve_ai(uuid,uuid,text,text,text,text),public.finish_ai(uuid,uuid,boolean,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_ai(uuid,uuid,text,text,text,text),public.finish_ai(uuid,uuid,boolean,jsonb) TO service_role;
CREATE FUNCTION public.enforce_plan_writes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE a jsonb; BEGIN
IF TG_TABLE_NAME='buckets' THEN
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text,0)); a:=access_for(NEW.user_id);
 IF NOT (a->>'paid')::boolean AND (SELECT count(*) FROM buckets WHERE user_id=NEW.user_id)>=3 THEN RAISE EXCEPTION 'Free includes 3 custom buckets. Existing buckets stay available'; END IF;
ELSE
 IF NEW.scheduled_at IS NOT NULL AND (TG_OP='INSERT' OR NEW.scheduled_at IS DISTINCT FROM OLD.scheduled_at OR NEW.user_id IS DISTINCT FROM OLD.user_id) AND NOT (access_for(NEW.user_id)->>'paid')::boolean THEN RAISE EXCEPTION 'Paid access is needed to add or move plan dates. You can still view and remove dates'; END IF;
END IF; RETURN NEW; END $$;
CREATE TRIGGER bucket_plan_cap BEFORE INSERT ON public.buckets FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_writes();
CREATE TRIGGER planner_plan_access BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_writes();
CREATE FUNCTION public.manage_complimentary(p_actor uuid,p_recipient uuid,p_action text,p_expiry timestamptz DEFAULT null,p_ack boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE g uuid; a jsonb; BEGIN
IF NOT has_role(p_actor,'admin') THEN RAISE EXCEPTION 'Admin access required'; END IF;
IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id=p_recipient) THEN RAISE EXCEPTION 'Existing account not found'; END IF;
PERFORM pg_advisory_xact_lock(hashtextextended(p_recipient::text,0));
a:=access_for(p_recipient);
IF p_action='grant' THEN
 IF p_expiry IS NOT NULL AND p_expiry<=now() THEN RAISE EXCEPTION 'Expiry must be in the future'; END IF;
 IF (a->>'billing_active')::boolean AND NOT p_ack THEN RAISE EXCEPTION 'This account has active billing. A gift does not cancel billing; acknowledgement required'; END IF;
 INSERT INTO complimentary_grants(user_id,created_by,expires_at) VALUES(p_recipient,p_actor,p_expiry) RETURNING id INTO g;
ELSIF p_action='revoke' THEN
 UPDATE complimentary_grants SET revoked_at=now(),revoked_by=p_actor WHERE user_id=p_recipient AND revoked_at IS NULL;
ELSE RAISE EXCEPTION 'Invalid action'; END IF;
INSERT INTO access_audit(recipient_id,actor_id,action,grant_id,details) VALUES(p_recipient,p_actor,p_action,g,jsonb_build_object('expires_at',p_expiry,'billing_acknowledged',p_ack));
RETURN access_for(p_recipient); END $$;
REVOKE ALL ON FUNCTION public.manage_complimentary(uuid,uuid,text,timestamptz,boolean) FROM PUBLIC,anon,authenticated; GRANT EXECUTE ON FUNCTION public.manage_complimentary(uuid,uuid,text,timestamptz,boolean) TO service_role;
ALTER TABLE public.dumps ADD COLUMN media_prepared_at timestamptz, ADD COLUMN extracted_text text;
COMMENT ON TABLE public.billing_entitlements IS 'Only verified provider webhooks/privileged integration may write. No billing integration enabled.';
COMMENT ON FUNCTION public.plan_config(boolean) IS 'Paid 100/month limits are INTERNAL provisional development limits; final allowances and USD price pending.';