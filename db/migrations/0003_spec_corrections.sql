-- Corrections from the Padmore.com backend specification v1.0.
--
-- Requires the app_server login role to exist. Its password is set outside this
-- file so that it never enters version control.

BEGIN;


-- ============================================================================
-- 1. NO THIRD-PARTY FILE PROVIDER
-- ============================================================================

-- Cloudinary is excluded and file storage is deferred. The table keeps its
-- metadata role without naming a provider.

ALTER TABLE public.media_assets
    ALTER COLUMN provider DROP DEFAULT,
    DROP CONSTRAINT media_assets_provider_check;


-- ============================================================================
-- 2. GUEST INQUIRY CLAIM TOKENS
-- ============================================================================

-- Lets a guest return to their inquiry. Only a hash of the random token is
-- stored, and only the trusted server can touch this table.

CREATE TABLE public.inquiry_claim_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    inquiry_id UUID NOT NULL
        REFERENCES public.inquiries(id) ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX inquiry_claim_tokens_inquiry_idx
    ON public.inquiry_claim_tokens(inquiry_id);

ALTER TABLE public.inquiry_claim_tokens ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 3. RATE LIMITING
-- ============================================================================

-- Serverless instances share no memory, so the counter lives in the database.
-- The upsert is atomic, so concurrent requests cannot slip past the limit.

CREATE TABLE app_private.rate_limits (
    bucket TEXT PRIMARY KEY,
    hits INTEGER NOT NULL,
    window_ends_at TIMESTAMPTZ NOT NULL
);

CREATE OR REPLACE FUNCTION app_private.consume_rate_limit(
    bucket_key TEXT,
    max_hits INTEGER,
    window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
    INSERT INTO app_private.rate_limits AS rl (bucket, hits, window_ends_at)
    VALUES (
        bucket_key,
        1,
        pg_catalog.now() + pg_catalog.make_interval(secs => window_seconds)
    )
    ON CONFLICT (bucket) DO UPDATE SET
        hits = CASE
            WHEN rl.window_ends_at <= pg_catalog.now() THEN 1
            ELSE rl.hits + 1
        END,
        window_ends_at = CASE
            WHEN rl.window_ends_at <= pg_catalog.now() THEN EXCLUDED.window_ends_at
            ELSE rl.window_ends_at
        END
    RETURNING hits <= max_hits;
$$;

REVOKE ALL ON TABLE app_private.rate_limits FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.consume_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;


-- ============================================================================
-- 4. LEAST-PRIVILEGE TABLE GRANTS FOR SIGNED-IN USERS
-- ============================================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

GRANT SELECT, INSERT, DELETE ON
    public.user_roles,
    public.follows,
    public.project_technologies,
    public.post_categories,
    public.post_tags,
    public.post_revisions,
    public.post_reactions,
    public.inquiry_messages,
    public.inquiry_attachments
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.profiles,
    public.newsletter_subscribers,
    public.social_links,
    public.media_assets,
    public.achievements,
    public.projects,
    public.technologies,
    public.project_media,
    public.project_updates,
    public.posts,
    public.categories,
    public.tags,
    public.post_media,
    public.post_comments,
    public.inquiries,
    public.project_request_details,
    public.collaboration_request_details,
    public.products,
    public.product_media,
    public.product_plans,
    public.product_files,
    public.site_settings
TO authenticated;

GRANT SELECT ON
    public.orders,
    public.order_items,
    public.payments,
    public.payment_events,
    public.download_entitlements,
    public.subscriptions,
    public.audit_logs
TO authenticated;


-- ============================================================================
-- 5. TRUSTED SERVER ROLE
-- ============================================================================

-- Used by server-side code for work no end user may do directly: guest forms,
-- verified payment processing, audit records and rate limiting. It cannot read
-- or change roles, content or profiles. Public pages read under the same
-- policies as a guest, so it never sees drafts or private records.

GRANT USAGE ON SCHEMA public TO app_server;
GRANT USAGE ON SCHEMA app_private TO app_server;

GRANT EXECUTE ON FUNCTION
    app_private.consume_rate_limit(TEXT, INTEGER, INTEGER)
TO app_server;

GRANT INSERT ON
    public.inquiries,
    public.project_request_details,
    public.collaboration_request_details,
    public.audit_logs
TO app_server;

-- RETURNING on a guest inquiry needs the row back.
GRANT SELECT ON public.inquiries TO app_server;

GRANT SELECT, INSERT, UPDATE ON
    public.newsletter_subscribers,
    public.inquiry_claim_tokens,
    public.orders,
    public.payments,
    public.payment_events,
    public.download_entitlements,
    public.download_access_tokens,
    public.subscriptions
TO app_server;

GRANT SELECT, INSERT ON public.order_items TO app_server;

GRANT SELECT ON public.product_files TO app_server;

GRANT SELECT ON
    public.profiles,
    public.follows,
    public.social_links,
    public.media_assets,
    public.achievements,
    public.projects,
    public.technologies,
    public.project_technologies,
    public.project_media,
    public.project_updates,
    public.posts,
    public.categories,
    public.post_categories,
    public.tags,
    public.post_tags,
    public.post_media,
    public.post_comments,
    public.post_reactions,
    public.products,
    public.product_media,
    public.product_plans,
    public.site_settings
TO app_server;

DO $$
DECLARE
    public_policy RECORD;
BEGIN
    FOR public_policy IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND policyname LIKE '%\_public\_read'
    LOOP
        EXECUTE FORMAT(
            'ALTER POLICY %I ON public.%I TO anonymous, authenticated, app_server',
            public_policy.policyname,
            public_policy.tablename
        );
    END LOOP;
END;
$$;

DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'newsletter_subscribers',
        'inquiry_claim_tokens',
        'orders',
        'order_items',
        'payments',
        'payment_events',
        'download_entitlements',
        'download_access_tokens',
        'subscriptions',
        'product_files'
    ]
    LOOP
        EXECUTE FORMAT(
            'CREATE POLICY %I ON public.%I FOR ALL TO app_server
             USING (TRUE) WITH CHECK (TRUE)',
            table_name || '_server_access',
            table_name
        );
    END LOOP;
END;
$$;

-- Guest inquiries are inserted without an owner and read back once.
CREATE POLICY inquiries_server_guest_insert
ON public.inquiries
FOR INSERT
TO app_server
WITH CHECK (user_id IS NULL AND status = 'new');

CREATE POLICY inquiries_server_guest_read
ON public.inquiries
FOR SELECT
TO app_server
USING (user_id IS NULL);

CREATE POLICY project_request_details_server_insert
ON public.project_request_details
FOR INSERT
TO app_server
WITH CHECK (TRUE);

CREATE POLICY collaboration_request_details_server_insert
ON public.collaboration_request_details
FOR INSERT
TO app_server
WITH CHECK (TRUE);

CREATE POLICY audit_logs_server_insert
ON public.audit_logs
FOR INSERT
TO app_server
WITH CHECK (TRUE);

COMMIT;
