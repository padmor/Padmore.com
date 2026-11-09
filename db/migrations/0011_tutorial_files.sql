-- Files attached to a tutorial: documents (PDF, Word, Excel, PowerPoint, Markdown,
-- plain text), images, audio, and video, either uploaded or as a YouTube or Vimeo link.
-- Additive only: one new table.
--
-- Written by the trusted server role after the application has confirmed the
-- person is staff, the same way achievement_files and site_images are. Nothing
-- is granted to other roles, so the browser never reaches this table directly.

BEGIN;

CREATE TABLE public.tutorial_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('document', 'image', 'audio', 'video')),
    title TEXT NOT NULL CHECK (LENGTH(BTRIM(title)) BETWEEN 1 AND 150),
    file_name TEXT CHECK (file_name IS NULL OR LENGTH(file_name) <= 200),
    mime_type TEXT CHECK (mime_type IS NULL OR mime_type IN (
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/markdown', 'text/plain',
        'image/jpeg', 'image/png', 'image/webp',
        'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav',
        'video/mp4', 'video/webm'
    )),
    data BYTEA CHECK (data IS NULL OR OCTET_LENGTH(data) BETWEEN 1 AND 10485760),
    video_url TEXT CHECK (video_url IS NULL OR LENGTH(video_url) <= 2048),
    uploaded_by UUID REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        -- a video is either a link or an uploaded file
        (kind = 'video' AND (
            (video_url IS NOT NULL AND data IS NULL)
            OR (video_url IS NULL AND data IS NOT NULL AND mime_type IS NOT NULL)
        ))
        -- everything else is an uploaded file
        OR (kind <> 'video' AND data IS NOT NULL AND mime_type IS NOT NULL AND video_url IS NULL)
    )
);

CREATE INDEX tutorial_files_post_idx ON public.tutorial_files (post_id, created_at);

ALTER TABLE public.tutorial_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_files FORCE ROW LEVEL SECURITY;

CREATE POLICY tutorial_files_server_read ON public.tutorial_files FOR SELECT TO app_server USING (TRUE);
CREATE POLICY tutorial_files_server_insert ON public.tutorial_files FOR INSERT TO app_server WITH CHECK (TRUE);
CREATE POLICY tutorial_files_server_delete ON public.tutorial_files FOR DELETE TO app_server USING (TRUE);

GRANT SELECT, INSERT, DELETE ON public.tutorial_files TO app_server;

COMMIT;
