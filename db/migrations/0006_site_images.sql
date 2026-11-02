-- Images uploaded in the manager portal, stored in the database so no outside
-- storage service is involved. Every image here is public once it is attached
-- to published content, and its address is an unguessable id until then.

BEGIN;

CREATE TABLE public.site_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data BYTEA NOT NULL CHECK (OCTET_LENGTH(data) BETWEEN 1 AND 2097152),
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
    uploaded_by UUID REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images FORCE ROW LEVEL SECURITY;

CREATE POLICY site_images_public_read
ON public.site_images
FOR SELECT
TO anonymous, authenticated, app_server
USING (TRUE);

CREATE POLICY site_images_admin_manage
ON public.site_images
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());

GRANT SELECT, INSERT, DELETE ON public.site_images TO authenticated;
GRANT SELECT ON public.site_images TO app_server;

ALTER TABLE public.projects ADD COLUMN image_id UUID REFERENCES public.site_images(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN image_id UUID REFERENCES public.site_images(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN image_id UUID REFERENCES public.site_images(id) ON DELETE SET NULL;
ALTER TABLE public.achievements ADD COLUMN image_id UUID REFERENCES public.site_images(id) ON DELETE SET NULL;

COMMIT;

NOTIFY pgrst, 'reload schema';
