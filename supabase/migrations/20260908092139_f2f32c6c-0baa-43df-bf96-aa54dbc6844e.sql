-- Brand profiles
CREATE TABLE public.brand_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  what_you_do text,
  audience text,
  audience_problem text,
  tone_traits text[] NOT NULL DEFAULT '{}',
  voice_samples text[] NOT NULL DEFAULT '{}',
  banned_words text[] NOT NULL DEFAULT '{}',
  offers text,
  links text,
  cta_style text,
  platforms text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.brand_profiles TO authenticated;
GRANT ALL ON public.brand_profiles TO service_role;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own brand profile" ON public.brand_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Dumps
CREATE TABLE public.dumps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'text' CHECK (kind IN ('audio','text','image','link')),
  title text NOT NULL DEFAULT 'Untitled idea',
  raw_text text,
  summary text,
  tags text[] NOT NULL DEFAULT '{}',
  link_url text,
  file_path text,
  file_mime text,
  file_size bigint,
  duration_seconds numeric,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','used','archived')),
  processing_state text NOT NULL DEFAULT 'idle' CHECK (processing_state IN ('idle','processing','done','error')),
  processing_error text,
  legacy_project_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dumps TO authenticated;
GRANT ALL ON public.dumps TO service_role;
ALTER TABLE public.dumps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dumps" ON public.dumps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX dumps_user_created_idx ON public.dumps (user_id, created_at DESC);
CREATE INDEX dumps_search_idx ON public.dumps USING gin (
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(raw_text,'') || ' ' || coalesce(summary,''))
);

-- Dump assets
CREATE TABLE public.dump_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  dump_id uuid NOT NULL REFERENCES public.dumps (id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_mime text,
  file_size bigint,
  extracted_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dump_assets TO authenticated;
GRANT ALL ON public.dump_assets TO service_role;
ALTER TABLE public.dump_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dump assets" ON public.dump_assets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Posts extensions
ALTER TABLE public.posts
  ADD COLUMN dump_id uuid REFERENCES public.dumps (id) ON DELETE CASCADE,
  ADD COLUMN platform text,
  ADD COLUMN variant text,
  ADD COLUMN prompt_notes text,
  ADD COLUMN char_count integer,
  ADD COLUMN title text,
  ALTER COLUMN project_id DROP NOT NULL;

CREATE INDEX posts_dump_idx ON public.posts (dump_id);

-- Migrate existing projects into dumps
INSERT INTO public.dumps (user_id, kind, title, file_path, file_mime, file_size, duration_seconds, status, legacy_project_id, created_at, updated_at)
SELECT p.user_id,
       CASE WHEN p.audio_path IS NOT NULL THEN 'audio' ELSE 'text' END,
       p.title,
       p.audio_path,
       p.audio_mime,
       p.audio_size,
       p.duration_seconds,
       'new',
       p.id,
       p.created_at,
       p.updated_at
FROM public.projects p;

UPDATE public.posts po
SET dump_id = d.id
FROM public.dumps d
WHERE d.legacy_project_id = po.project_id AND po.dump_id IS NULL;

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dumps_updated_at BEFORE UPDATE ON public.dumps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dump_assets_updated_at BEFORE UPDATE ON public.dump_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();