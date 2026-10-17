-- Ensure linked rows (bucket/idea/dump) always belong to the same user.
CREATE OR REPLACE FUNCTION public.check_same_owner_refs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.bucket_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.buckets b WHERE b.id = NEW.bucket_id AND b.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'bucket_id must reference one of your own buckets';
  END IF;
  IF TG_TABLE_NAME = 'posts' THEN
    IF NEW.idea_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.ideas i WHERE i.id = NEW.idea_id AND i.user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'idea_id must reference one of your own ideas';
    END IF;
  END IF;
  IF TG_TABLE_NAME IN ('posts', 'ideas') THEN
    IF NEW.dump_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.dumps d WHERE d.id = NEW.dump_id AND d.user_id = NEW.user_id
    ) THEN
      RAISE EXCEPTION 'dump_id must reference one of your own dumps';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_posts_owner_refs ON public.posts;
CREATE TRIGGER trg_posts_owner_refs
BEFORE INSERT OR UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.check_same_owner_refs();

DROP TRIGGER IF EXISTS trg_ideas_owner_refs ON public.ideas;
CREATE TRIGGER trg_ideas_owner_refs
BEFORE INSERT OR UPDATE ON public.ideas
FOR EACH ROW EXECUTE FUNCTION public.check_same_owner_refs();