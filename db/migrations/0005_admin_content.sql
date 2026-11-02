-- Fields the store interface displays, and collaboration opportunities, so the
-- manager portal can publish them instead of the code holding sample data.

BEGIN;

ALTER TABLE public.products
    ADD COLUMN category TEXT,
    ADD COLUMN artwork TEXT NOT NULL DEFAULT 'toolkit'
        CHECK (artwork IN ('design', 'toolkit', 'react', 'bundle')),
    ADD COLUMN license TEXT CHECK (license IS NULL OR LENGTH(license) <= 200);

CREATE TABLE public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (LENGTH(title) BETWEEN 1 AND 150),
    description TEXT NOT NULL CHECK (LENGTH(description) BETWEEN 1 AND 1000),
    area TEXT CHECK (area IS NULL OR LENGTH(area) <= 80),
    commitment TEXT CHECK (commitment IS NULL OR LENGTH(commitment) <= 80),
    arrangement TEXT CHECK (arrangement IS NULL OR LENGTH(arrangement) <= 80),
    is_open BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION app_private.set_updated_at();

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities FORCE ROW LEVEL SECURITY;

CREATE POLICY opportunities_public_read
ON public.opportunities
FOR SELECT
TO anonymous, authenticated, app_server
USING (is_open = TRUE);

CREATE POLICY opportunities_admin_manage
ON public.opportunities
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT SELECT ON public.opportunities TO anonymous, app_server;

COMMIT;

NOTIFY pgrst, 'reload schema';
