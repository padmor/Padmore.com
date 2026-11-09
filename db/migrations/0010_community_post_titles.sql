-- Community posts get a title, so the feed reads as an ordered list of topics.
-- Additive only: one nullable column. Posts made before this have no title.

BEGIN;

ALTER TABLE public.community_posts
    ADD COLUMN title TEXT CHECK (title IS NULL OR LENGTH(BTRIM(title)) BETWEEN 1 AND 150);

COMMIT;
