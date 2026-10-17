ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS voice_mode text, ADD COLUMN IF NOT EXISTS reference_note text, ADD COLUMN IF NOT EXISTS source_snapshot text;
COMMENT ON COLUMN public.posts.source_snapshot IS 'Snapshot of the original source text at creation time, so rewrites stay possible if the dump or idea is later deleted.';
ALTER TABLE public.dumps ADD COLUMN IF NOT EXISTS original_notes text;
COMMENT ON COLUMN public.dumps.original_notes IS 'The user-supplied note saved with an image/link dump, kept separate from AI-extracted text so reprocessing is idempotent.';
UPDATE public.dumps SET original_notes = raw_text WHERE kind IN ('image','link') AND original_notes IS NULL AND raw_text IS NOT NULL;