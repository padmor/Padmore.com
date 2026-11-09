-- People who follow the site owner. Additive only: one new table.
--
-- The older public.follows table needs a public profile for both people, and no
-- profiles exist, so it cannot be used for this. This table holds just who
-- follows, one row per signed-in member.
--
-- Written by the trusted server role after the application has confirmed who the
-- person is, the same way the community tables are. Nothing is granted to other
-- roles, so the browser never reaches this table directly.

BEGIN;

CREATE TABLE public.site_followers (
    user_id UUID PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_followers FORCE ROW LEVEL SECURITY;

CREATE POLICY site_followers_server_read ON public.site_followers FOR SELECT TO app_server USING (TRUE);
CREATE POLICY site_followers_server_insert ON public.site_followers FOR INSERT TO app_server WITH CHECK (TRUE);
CREATE POLICY site_followers_server_delete ON public.site_followers FOR DELETE TO app_server USING (TRUE);

GRANT SELECT, INSERT, DELETE ON public.site_followers TO app_server;

COMMIT;
