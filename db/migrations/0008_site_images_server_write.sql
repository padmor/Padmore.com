-- Image bytes are written by the server after it has confirmed the staff role,
-- as audit records are, instead of through the Data API. The trusted role can
-- only add and remove rows in this table.

BEGIN;

GRANT INSERT, DELETE ON public.site_images TO app_server;

CREATE POLICY site_images_server_insert
ON public.site_images
FOR INSERT
TO app_server
WITH CHECK (TRUE);

CREATE POLICY site_images_server_delete
ON public.site_images
FOR DELETE
TO app_server
USING (TRUE);

COMMIT;

NOTIFY pgrst, 'reload schema';
