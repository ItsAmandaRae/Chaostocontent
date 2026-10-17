UPDATE public.dumps SET media_prepared_at=updated_at WHERE kind IN ('audio','image') AND processing_state='done' AND raw_text IS NOT NULL AND media_prepared_at IS NULL;
CREATE OR REPLACE FUNCTION public.finish_ai(p_user uuid,p_request uuid,p_success boolean,p_result jsonb DEFAULT null) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r ai_usage; post_id uuid; BEGIN
PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0)); SELECT * INTO r FROM ai_usage WHERE user_id=p_user AND request_id=p_request FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Reservation missing'; END IF;
IF r.state='succeeded' THEN RETURN r.result; END IF;
IF r.state<>'reserved' OR r.reserved_until<=now() THEN RAISE EXCEPTION 'Reservation ended'; END IF;
IF NOT p_success THEN UPDATE ai_usage SET state='failed' WHERE id=r.id; RETURN null; END IF;
IF r.action='create' THEN
INSERT INTO posts(user_id,dump_id,idea_id,platform,variant,title,content,char_count,status,prompt_notes,voice_mode,reference_note,source_snapshot) VALUES(p_user,(p_result->>'dump_id')::uuid,(p_result->>'idea_id')::uuid,p_result->>'platform',p_result->>'variant',p_result->>'title',p_result->>'content',length(p_result->>'content'),'draft',p_result->>'prompt_notes',p_result->>'voice_mode',p_result->>'reference_note',p_result->>'source_snapshot') RETURNING id INTO post_id;
p_result:=jsonb_build_object('ok',true,'posts',jsonb_build_array(jsonb_build_object('id',post_id,'platform',p_result->>'platform','content',p_result->>'content')));
ELSIF r.action='read' THEN
UPDATE dumps SET raw_text=p_result->>'raw_text',extracted_text=p_result->>'extracted_text',media_prepared_at=now(),title=p_result->>'title',summary='',tags='{}',processing_state='done',processing_error=null WHERE id=r.source_key::uuid AND user_id=p_user;
IF NOT FOUND THEN RAISE EXCEPTION 'Original source is no longer available'; END IF;
END IF;
UPDATE ai_usage SET state='succeeded',result=p_result WHERE id=r.id; RETURN p_result; END $$;
CREATE FUNCTION public.protect_media_preparation() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN IF current_user IN ('authenticated','anon') AND ((TG_OP='INSERT' AND (NEW.media_prepared_at IS NOT NULL OR NEW.extracted_text IS NOT NULL)) OR (TG_OP='UPDATE' AND (NEW.media_prepared_at IS DISTINCT FROM OLD.media_prepared_at OR NEW.extracted_text IS DISTINCT FROM OLD.extracted_text))) THEN RAISE EXCEPTION 'Media preparation is server managed'; END IF; RETURN NEW; END $$;
CREATE TRIGGER protected_media_fields BEFORE INSERT OR UPDATE ON public.dumps FOR EACH ROW EXECUTE FUNCTION public.protect_media_preparation();