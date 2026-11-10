-- Anonymous, aggregate engagement events for the owner dashboard.
-- No email, account ID, IP address, referrer, user agent or free-form payload is stored.

BEGIN;

CREATE TABLE public.site_engagement_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name TEXT NOT NULL CHECK (event_name IN (
        'page_view',
        'project_open',
        'tutorial_open',
        'product_open',
        'follow_click',
        'follow_added',
        'follow_removed',
        'signup_completed',
        'newsletter_subscribed',
        'project_request_submitted',
        'collaboration_submitted',
        'cart_added',
        'save_added',
        'save_removed',
        'community_post_attempt'
    )),
    pathname TEXT NOT NULL CHECK (
        length(pathname) BETWEEN 1 AND 240
        AND pathname ~ '^/[A-Za-z0-9._~/%-]*$'
    ),
    entity_slug TEXT CHECK (
        entity_slug IS NULL
        OR (length(entity_slug) <= 120 AND entity_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX site_engagement_events_created_at_idx
    ON public.site_engagement_events (created_at DESC);
CREATE INDEX site_engagement_events_event_date_idx
    ON public.site_engagement_events (event_name, created_at DESC);
CREATE INDEX site_engagement_events_path_date_idx
    ON public.site_engagement_events (pathname, created_at DESC);

ALTER TABLE public.site_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_engagement_events FORCE ROW LEVEL SECURITY;

CREATE POLICY site_engagement_events_server_insert
    ON public.site_engagement_events FOR INSERT TO app_server
    WITH CHECK (TRUE);
CREATE POLICY site_engagement_events_server_read
    ON public.site_engagement_events FOR SELECT TO app_server
    USING (TRUE);

GRANT INSERT, SELECT ON public.site_engagement_events TO app_server;

COMMIT;
