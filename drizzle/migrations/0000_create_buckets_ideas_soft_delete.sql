CREATE TABLE public.buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.buckets TO authenticated;
GRANT ALL ON public.buckets TO service_role;
ALTER TABLE public.buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own buckets" ON public.buckets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX buckets_user_idx ON public.buckets (user_id);

CREATE TABLE public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dump_id uuid REFERENCES public.dumps(id) ON DELETE SET NULL,
  bucket_id uuid REFERENCES public.buckets(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT 'Untitled idea',
  angle text,
  source_excerpt text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ideas TO authenticated;
GRANT ALL ON public.ideas TO service_role;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ideas" ON public.ideas FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ideas_user_idx ON public.ideas (user_id);
CREATE INDEX ideas_dump_idx ON public.ideas (dump_id);
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.posts ADD COLUMN bucket_id uuid REFERENCES public.buckets(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN idea_id uuid REFERENCES public.ideas(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN deleted_at timestamptz;
CREATE INDEX posts_bucket_idx ON public.posts (bucket_id);
CREATE INDEX posts_idea_idx ON public.posts (idea_id);