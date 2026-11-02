-- Optional cover image on collaboration opportunities, like the other content types.

BEGIN;

ALTER TABLE public.opportunities ADD COLUMN image_id UUID REFERENCES public.site_images(id) ON DELETE SET NULL;

COMMIT;

NOTIFY pgrst, 'reload schema';
