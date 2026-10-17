ALTER TABLE public.buckets DROP CONSTRAINT buckets_color_palette;
ALTER TABLE public.buckets ADD CONSTRAINT buckets_color_palette CHECK (color IN ('pink','cyan','mint','yellow','lavender','peach','sky','lime','rose','periwinkle','apricot','silver'));
ALTER TABLE public.buckets ALTER COLUMN color SET DEFAULT 'auto';
CREATE OR REPLACE FUNCTION public.assign_bucket_color() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE palette text[] := ARRAY['pink','cyan','mint','yellow','lavender','peach','sky','lime','rose','periwinkle','apricot','silver'];
BEGIN
 IF NEW.color='auto' THEN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text,0));
  SELECT c INTO NEW.color FROM unnest(palette) WITH ORDINALITY AS p(c,n) WHERE NOT EXISTS (SELECT 1 FROM public.buckets b WHERE b.user_id=NEW.user_id AND b.color=c) ORDER BY n LIMIT 1;
  IF NEW.color IS NULL THEN NEW.color:=palette[1]; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER assign_bucket_color BEFORE INSERT ON public.buckets FOR EACH ROW EXECUTE FUNCTION public.assign_bucket_color();
CREATE OR REPLACE FUNCTION public.reuse_content(p_post uuid, p_platform text, p_expected_text text, p_copy_id uuid DEFAULT NULL) RETURNS public.posts LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE source public.posts; result public.posts;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to reuse content'; END IF;
 IF p_platform IS NULL OR p_platform NOT IN ('twitter','instagram','tiktok','youtube_shorts','linkedin','threads','facebook','newsletter','blog','youtube') THEN RAISE EXCEPTION 'Choose a supported destination'; END IF;
 SELECT * INTO source FROM public.posts WHERE id=p_post AND user_id=auth.uid() AND deleted_at IS NULL FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Content unavailable for this account'; END IF;
 IF coalesce(source.content,'') IS DISTINCT FROM p_expected_text THEN RAISE EXCEPTION 'Your latest wording has not saved. Retry saving before reusing it'; END IF;
 IF p_copy_id IS NULL THEN
  UPDATE public.posts SET platform=p_platform WHERE id=source.id AND user_id=auth.uid() RETURNING * INTO result;
 ELSE
  IF source.project_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.projects WHERE id=source.project_id AND user_id=auth.uid()) THEN RAISE EXCEPTION 'Source project unavailable'; END IF;
  INSERT INTO public.posts (id,user_id,project_id,dump_id,idea_id,bucket_id,title,content,char_count,platform,variant,prompt_notes,voice_mode,reference_note,source_snapshot,status)
  VALUES (p_copy_id,auth.uid(),source.project_id,source.dump_id,source.idea_id,source.bucket_id,source.title,source.content,length(coalesce(source.content,'')),p_platform,source.variant,source.prompt_notes,source.voice_mode,source.reference_note,source.source_snapshot,'draft') ON CONFLICT(id) DO NOTHING RETURNING * INTO result;
  IF result.id IS NULL THEN
   SELECT * INTO result FROM public.posts WHERE id=p_copy_id AND user_id=auth.uid() AND platform=p_platform AND dump_id IS NOT DISTINCT FROM source.dump_id AND idea_id IS NOT DISTINCT FROM source.idea_id AND source_snapshot IS NOT DISTINCT FROM source.source_snapshot;
   IF NOT FOUND THEN RAISE EXCEPTION 'Copy request conflict'; END IF;
  END IF;
 END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.reuse_content(uuid,text,text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reuse_content(uuid,text,text,uuid) TO authenticated;
COMMENT ON FUNCTION public.reuse_content(uuid,text,text,uuid) IS 'Owner-scoped metadata-only reuse; expected saved text guards stale copies, caller copy id makes retries idempotent. No AI operations.';