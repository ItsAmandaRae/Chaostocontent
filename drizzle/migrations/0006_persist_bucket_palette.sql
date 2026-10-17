ALTER TABLE public.buckets ADD COLUMN color text NOT NULL DEFAULT 'pink';
UPDATE public.buckets SET color = (ARRAY['pink','cyan','mint','yellow'])[1 + (get_byte(decode(replace(id::text, '-', ''), 'hex'), 0) % 4)];
ALTER TABLE public.buckets ALTER COLUMN color SET DEFAULT ( (ARRAY['pink','cyan','mint','yellow'])[1 + floor(random() * 4)::integer] );
ALTER TABLE public.buckets ADD CONSTRAINT buckets_color_palette CHECK (color IN ('pink','cyan','mint','yellow'));
COMMENT ON COLUMN public.buckets.color IS 'Optional accessible palette key; default assigned automatically. Existing owner RLS and bucket allowance triggers remain in force.';