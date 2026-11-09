-- Community (posts, replies, likes) and files attached to achievements.
-- Additive only: new tables, plus one new column on achievements.
--
-- Both features are written by the trusted server role after the application has
-- confirmed who the person is (and, for achievement files, that they are staff),
-- the same way site_images and audit records are. The browser never reaches
-- these tables directly, so every table below grants nothing to other roles.

BEGIN;

-- Lets the Achievements page separate certificates from awards and other work.
ALTER TABLE public.achievements
    ADD COLUMN category TEXT NOT NULL DEFAULT 'milestone'
    CHECK (category IN ('certificate', 'award', 'milestone'));

-- ---------------------------------------------------------------------------
-- Files attached to an achievement: documents and images are stored as bytes,
-- videos as a link to YouTube or Vimeo (large videos do not suit a database).
-- ---------------------------------------------------------------------------
CREATE TABLE public.achievement_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('document', 'image', 'video')),
    title TEXT NOT NULL CHECK (LENGTH(BTRIM(title)) BETWEEN 1 AND 150),
    file_name TEXT CHECK (file_name IS NULL OR LENGTH(file_name) <= 200),
    mime_type TEXT CHECK (mime_type IS NULL OR mime_type IN (
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg', 'image/png', 'image/webp'
    )),
    data BYTEA CHECK (data IS NULL OR OCTET_LENGTH(data) BETWEEN 1 AND 10485760),
    video_url TEXT CHECK (video_url IS NULL OR LENGTH(video_url) <= 2048),
    uploaded_by UUID REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        (kind = 'video' AND video_url IS NOT NULL AND data IS NULL)
        OR (kind <> 'video' AND data IS NOT NULL AND mime_type IS NOT NULL AND video_url IS NULL)
    )
);

CREATE INDEX achievement_files_achievement_idx ON public.achievement_files (achievement_id, created_at);

ALTER TABLE public.achievement_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_files FORCE ROW LEVEL SECURITY;

CREATE POLICY achievement_files_server_read ON public.achievement_files FOR SELECT TO app_server USING (TRUE);
CREATE POLICY achievement_files_server_insert ON public.achievement_files FOR INSERT TO app_server WITH CHECK (TRUE);
CREATE POLICY achievement_files_server_delete ON public.achievement_files FOR DELETE TO app_server USING (TRUE);

GRANT SELECT, INSERT, DELETE ON public.achievement_files TO app_server;

-- ---------------------------------------------------------------------------
-- Community: anyone can read, signed-in members write. The author's name is
-- copied onto the row when they post, so reading never needs the user table.
-- ---------------------------------------------------------------------------
CREATE TABLE public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL CHECK (LENGTH(BTRIM(author_name)) BETWEEN 1 AND 200),
    body TEXT NOT NULL CHECK (LENGTH(BTRIM(body)) BETWEEN 1 AND 2000),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX community_posts_feed_idx ON public.community_posts (status, created_at DESC);
CREATE INDEX community_posts_user_idx ON public.community_posts (user_id);

CREATE TABLE public.community_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL CHECK (LENGTH(BTRIM(author_name)) BETWEEN 1 AND 200),
    body TEXT NOT NULL CHECK (LENGTH(BTRIM(body)) BETWEEN 1 AND 1000),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX community_replies_post_idx ON public.community_replies (post_id, created_at);
CREATE INDEX community_replies_user_idx ON public.community_replies (user_id);

CREATE TABLE public.community_likes (
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies FORCE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes FORCE ROW LEVEL SECURITY;

CREATE POLICY community_posts_server_read ON public.community_posts FOR SELECT TO app_server USING (TRUE);
CREATE POLICY community_posts_server_insert ON public.community_posts FOR INSERT TO app_server WITH CHECK (TRUE);
CREATE POLICY community_posts_server_update ON public.community_posts FOR UPDATE TO app_server USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY community_posts_server_delete ON public.community_posts FOR DELETE TO app_server USING (TRUE);

CREATE POLICY community_replies_server_read ON public.community_replies FOR SELECT TO app_server USING (TRUE);
CREATE POLICY community_replies_server_insert ON public.community_replies FOR INSERT TO app_server WITH CHECK (TRUE);
CREATE POLICY community_replies_server_update ON public.community_replies FOR UPDATE TO app_server USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY community_replies_server_delete ON public.community_replies FOR DELETE TO app_server USING (TRUE);

CREATE POLICY community_likes_server_read ON public.community_likes FOR SELECT TO app_server USING (TRUE);
CREATE POLICY community_likes_server_insert ON public.community_likes FOR INSERT TO app_server WITH CHECK (TRUE);
CREATE POLICY community_likes_server_delete ON public.community_likes FOR DELETE TO app_server USING (TRUE);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO app_server;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_replies TO app_server;
GRANT SELECT, INSERT, DELETE ON public.community_likes TO app_server;

COMMIT;

NOTIFY pgrst, 'reload schema';
