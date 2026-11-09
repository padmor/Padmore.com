-- Projects and tutorials a signed-in member has saved. Additive only: one new table.
--
-- Until now a saved item lived only in the visitor's browser. This keeps it with
-- the account, so it follows the person to any device and shows on the dashboard.
--
-- Written by the trusted server role after the application has confirmed who the
-- person is, the same way the community tables are. Nothing is granted to other
-- roles, so the browser never reaches this table directly.

BEGIN;

CREATE TABLE public.saved_items (
    user_id UUID NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('project', 'tutorial')),
    slug TEXT NOT NULL CHECK (LENGTH(slug) <= 120 AND slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, kind, slug)
);

CREATE INDEX saved_items_user_idx ON public.saved_items (user_id, created_at DESC);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items FORCE ROW LEVEL SECURITY;

CREATE POLICY saved_items_server_read ON public.saved_items FOR SELECT TO app_server USING (TRUE);
CREATE POLICY saved_items_server_insert ON public.saved_items FOR INSERT TO app_server WITH CHECK (TRUE);
CREATE POLICY saved_items_server_delete ON public.saved_items FOR DELETE TO app_server USING (TRUE);

GRANT SELECT, INSERT, DELETE ON public.saved_items TO app_server;

COMMIT;
