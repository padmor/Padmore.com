-- ============================================================================
-- PADMORE.COM
-- COMPLETE DATABASE SCHEMA + SECURITY
-- PostgreSQL / Neon / Neon Auth / Neon Data API
--
-- Application:
--   Next.js + Vercel
--
-- Database:
--   Neon PostgreSQL
--
-- ORM:
--   Drizzle ORM
--
-- Authentication:
--   Neon Auth (managed schema: neon_auth)
--
-- Public media:
--   Cloudinary
--
-- Private downloadable files:
--   Private S3-compatible object storage
--
-- IMPORTANT:
--   1. Enable Neon Auth and the Neon Data API first.
--   2. This script assumes app_private.current_user_id(), anonymous and
--      authenticated are available.
--   3. Do not expose an owner/database-owner connection string
--      to the browser.
--   4. Run first on a development branch.
--   5. User references are UUID, matching neon_auth."user".id as confirmed on
--      the Neon branch.
--
-- PROVENANCE:
--   The original draft was truncated inside section 20. The remainder of
--   section 20 and sections 21-24 were written afterwards to complete it, and
--   should be reviewed against the original draft if that is available.
-- ============================================================================


-- All or nothing: a failure part-way leaves the database untouched.
BEGIN;


-- ============================================================================
-- 0. SCHEMAS AND BASE PERMISSIONS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS app_private;

REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated;

REVOKE ALL ON SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO anonymous, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE ALL ON TABLES FROM PUBLIC;


-- ============================================================================
-- 1. SECURITY ROLES
-- ============================================================================

-- Neon Auth owns identity records.
-- We reference neon_auth."user"; we do not recreate passwords,
-- authentication sessions or authentication tokens.

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES neon_auth."user"(id) ON DELETE CASCADE,

    role TEXT NOT NULL
        CHECK (
            role IN ('owner', 'admin', 'editor', 'support')
        ),

    assigned_by UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, role)
);

CREATE INDEX user_roles_user_id_idx
    ON public.user_roles(user_id);


-- ============================================================================
-- 2. SECURITY HELPER FUNCTIONS
-- ============================================================================

-- These functions use the identity provided by the verified
-- Neon Auth JWT. They must not use user IDs supplied by the browser.

-- neon_auth."user".id is UUID, and the JWT subject arrives from auth.user_id().
-- Every policy goes through this so the comparison is always UUID to UUID.
--
-- SECURITY DEFINER because Neon owns the auth schema, and the owner of this
-- database can use it but cannot grant it to authenticated. It takes no input
-- and returns only the identity from the caller's own verified JWT.

CREATE OR REPLACE FUNCTION app_private.current_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT auth.user_id()::UUID;
$$;

CREATE OR REPLACE FUNCTION app_private.has_any_role(
    allowed_roles TEXT[]
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles AS ur
        WHERE ur.user_id = app_private.current_user_id()
          AND ur.role = ANY (allowed_roles)
    );
$$;

CREATE OR REPLACE FUNCTION app_private.is_owner()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT app_private.has_any_role(
        ARRAY['owner']::TEXT[]
    );
$$;

CREATE OR REPLACE FUNCTION app_private.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT app_private.has_any_role(
        ARRAY['owner', 'admin']::TEXT[]
    );
$$;

CREATE OR REPLACE FUNCTION app_private.can_manage_content()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT app_private.has_any_role(
        ARRAY['owner', 'admin', 'editor']::TEXT[]
    );
$$;

CREATE OR REPLACE FUNCTION app_private.can_manage_inquiries()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT app_private.has_any_role(
        ARRAY['owner', 'admin', 'support']::TEXT[]
    );
$$;

CREATE OR REPLACE FUNCTION app_private.can_manage_commerce()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT app_private.has_any_role(
        ARRAY['owner', 'admin']::TEXT[]
    );
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app_private FROM PUBLIC;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_private
TO authenticated;


-- ============================================================================
-- 3. IDENTITY AND COMMUNITY
-- ============================================================================

-- 3.1 Public user profiles

CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY
        REFERENCES neon_auth."user"(id) ON DELETE CASCADE,

    username TEXT NOT NULL,
    display_name TEXT NOT NULL,

    bio TEXT,
    avatar_media_id UUID,

    website_url TEXT,
    location TEXT,

    is_public BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (username ~ '^[A-Za-z0-9_]{3,30}$'),

    -- Users write these directly, so they are bounded here. The URL rule also
    -- stops javascript: links from being stored and rendered on a profile.
    CHECK (LENGTH(display_name) BETWEEN 1 AND 100),
    CHECK (bio IS NULL OR LENGTH(bio) <= 2000),
    CHECK (location IS NULL OR LENGTH(location) <= 200),
    CHECK (
        website_url IS NULL
        OR (website_url ~* '^https?://' AND LENGTH(website_url) <= 2048)
    )
);

CREATE UNIQUE INDEX profiles_username_lower_idx
    ON public.profiles (LOWER(username));


-- 3.2 Followers

CREATE TABLE public.follows (
    follower_id UUID NOT NULL
        REFERENCES neon_auth."user"(id) ON DELETE CASCADE,

    followed_id UUID NOT NULL
        REFERENCES neon_auth."user"(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (follower_id, followed_id),

    CHECK (follower_id <> followed_id)
);

CREATE INDEX follows_followed_id_idx
    ON public.follows(followed_id);


-- 3.3 Newsletter subscriptions

CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN ('pending', 'active', 'unsubscribed')
        ),

    source TEXT,

    confirmation_token_hash TEXT,
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX newsletter_email_lower_idx
    ON public.newsletter_subscribers(LOWER(email));


-- 3.4 Social links

CREATE TABLE public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    platform TEXT NOT NULL,
    label TEXT,
    url TEXT NOT NULL,

    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 4. MEDIA ASSETS - CLOUDINARY
-- ============================================================================

-- The files are stored by Cloudinary.
-- This table holds their metadata and references.
--
-- Purchased source-code files do NOT belong here.
-- They use private object storage in the marketplace module.

CREATE TABLE public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider TEXT NOT NULL DEFAULT 'cloudinary'
        CHECK (provider = 'cloudinary'),

    provider_asset_id TEXT,
    public_id TEXT NOT NULL UNIQUE,

    secure_url TEXT NOT NULL,

    resource_type TEXT NOT NULL
        CHECK (
            resource_type IN ('image', 'video', 'raw')
        ),

    format TEXT,

    bytes BIGINT
        CHECK (bytes IS NULL OR bytes >= 0),

    width INTEGER
        CHECK (width IS NULL OR width > 0),

    height INTEGER
        CHECK (height IS NULL OR height > 0),

    alt_text TEXT,
    caption TEXT,

    visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (
            visibility IN ('public', 'private')
        ),

    status TEXT NOT NULL DEFAULT 'ready'
        CHECK (
            status IN ('uploading', 'ready', 'failed', 'deleted')
        ),

    uploaded_by UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX media_assets_uploaded_by_idx
    ON public.media_assets(uploaded_by);

CREATE INDEX media_assets_visibility_status_idx
    ON public.media_assets(visibility, status);

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_avatar_media_fk
FOREIGN KEY (avatar_media_id)
REFERENCES public.media_assets(id)
ON DELETE SET NULL;


-- ============================================================================
-- 5. ACHIEVEMENTS
-- ============================================================================

CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    description TEXT,

    organization TEXT,
    credential_url TEXT,
    achieved_on DATE,

    media_asset_id UUID
        REFERENCES public.media_assets(id) ON DELETE SET NULL,

    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 6. PORTFOLIO PROJECTS
-- ============================================================================

-- 6.1 Projects

CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    summary TEXT,
    description TEXT,

    lifecycle_status TEXT NOT NULL DEFAULT 'idea'
        CHECK (
            lifecycle_status IN (
                'idea',
                'planning',
                'in_progress',
                'paused',
                'completed',
                'archived'
            )
        ),

    visibility TEXT NOT NULL DEFAULT 'draft'
        CHECK (
            visibility IN ('draft', 'public', 'private')
        ),

    is_tested BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    demo_url TEXT,
    repository_url TEXT,

    started_on DATE,
    completed_on DATE,
    published_at TIMESTAMPTZ,

    created_by UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),

    CHECK (
        completed_on IS NULL
        OR started_on IS NULL
        OR completed_on >= started_on
    )
);

CREATE INDEX projects_status_idx
    ON public.projects(lifecycle_status);

CREATE INDEX projects_visibility_date_idx
    ON public.projects(visibility, published_at DESC);

CREATE INDEX projects_featured_idx
    ON public.projects(is_featured)
    WHERE is_featured = TRUE;


-- 6.2 Technologies

CREATE TABLE public.technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 6.3 Project technologies

CREATE TABLE public.project_technologies (
    project_id UUID NOT NULL
        REFERENCES public.projects(id) ON DELETE CASCADE,

    technology_id UUID NOT NULL
        REFERENCES public.technologies(id) ON DELETE RESTRICT,

    PRIMARY KEY (project_id, technology_id)
);

CREATE INDEX project_technologies_technology_idx
    ON public.project_technologies(technology_id);


-- 6.4 Project media

CREATE TABLE public.project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID NOT NULL
        REFERENCES public.projects(id) ON DELETE CASCADE,

    media_asset_id UUID NOT NULL
        REFERENCES public.media_assets(id) ON DELETE RESTRICT,

    role TEXT NOT NULL DEFAULT 'gallery'
        CHECK (
            role IN ('cover', 'gallery', 'video')
        ),

    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (project_id, media_asset_id)
);

CREATE INDEX project_media_project_idx
    ON public.project_media(project_id, sort_order);


-- 6.5 Project updates

CREATE TABLE public.project_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID NOT NULL
        REFERENCES public.projects(id) ON DELETE CASCADE,

    title TEXT NOT NULL,
    content TEXT NOT NULL,

    visibility TEXT NOT NULL DEFAULT 'draft'
        CHECK (
            visibility IN ('draft', 'public')
        ),

    created_by UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX project_updates_project_date_idx
    ON public.project_updates(project_id, created_at DESC);


-- ============================================================================
-- 7. PUBLICATIONS AND CONTENT STUDIO
-- ============================================================================

-- One publishing system powers articles, tutorials, thoughts,
-- announcements, development logs and project updates.

CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    author_id UUID NOT NULL
        REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,

    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    excerpt TEXT,

    -- Rich-text editor document.
    content_json JSONB NOT NULL DEFAULT '{}'::JSONB
        CHECK (jsonb_typeof(content_json) = 'object'),

    -- Extracted text for search and previews.
    search_text TEXT NOT NULL DEFAULT '',

    content_type TEXT NOT NULL
        CHECK (
            content_type IN (
                'article',
                'tutorial',
                'development_log',
                'project_update',
                'announcement',
                'personal_thought'
            )
        ),

    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (
            status IN (
                'draft',
                'scheduled',
                'published',
                'archived'
            )
        ),

    seo_title TEXT,
    seo_description TEXT,

    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,

    allow_comments BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),

    CHECK (
        status <> 'scheduled'
        OR scheduled_at IS NOT NULL
    ),

    CHECK (
        status <> 'published'
        OR published_at IS NOT NULL
    )
);

CREATE INDEX posts_status_type_date_idx
    ON public.posts(status, content_type, published_at DESC);

CREATE INDEX posts_author_idx
    ON public.posts(author_id);

CREATE INDEX posts_search_idx
    ON public.posts
    USING GIN (
        to_tsvector(
            'english',
            COALESCE(title, '') || ' ' ||
            COALESCE(excerpt, '') || ' ' ||
            COALESCE(search_text, '')
        )
    );


-- 7.1 Categories

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (name)
);

CREATE TABLE public.post_categories (
    post_id UUID NOT NULL
        REFERENCES public.posts(id) ON DELETE CASCADE,

    category_id UUID NOT NULL
        REFERENCES public.categories(id) ON DELETE RESTRICT,

    PRIMARY KEY (post_id, category_id)
);


-- 7.2 Tags

CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.post_tags (
    post_id UUID NOT NULL
        REFERENCES public.posts(id) ON DELETE CASCADE,

    tag_id UUID NOT NULL
        REFERENCES public.tags(id) ON DELETE RESTRICT,

    PRIMARY KEY (post_id, tag_id)
);


-- 7.3 Post media

CREATE TABLE public.post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    post_id UUID NOT NULL
        REFERENCES public.posts(id) ON DELETE CASCADE,

    media_asset_id UUID NOT NULL
        REFERENCES public.media_assets(id) ON DELETE RESTRICT,

    role TEXT NOT NULL DEFAULT 'inline'
        CHECK (
            role IN ('cover', 'inline', 'attachment')
        ),

    alt_text TEXT,
    caption TEXT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (post_id, media_asset_id)
);

CREATE INDEX post_media_post_idx
    ON public.post_media(post_id, sort_order);


-- 7.4 Post revisions

CREATE TABLE public.post_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    post_id UUID NOT NULL
        REFERENCES public.posts(id) ON DELETE CASCADE,

    saved_by UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    title_snapshot TEXT NOT NULL,
    excerpt_snapshot TEXT,
    content_snapshot JSONB NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX post_revisions_post_date_idx
    ON public.post_revisions(post_id, created_at DESC);


-- 7.5 Comments

CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    post_id UUID NOT NULL
        REFERENCES public.posts(id) ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES neon_auth."user"(id) ON DELETE CASCADE,

    parent_comment_id UUID,

    body TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN ('pending', 'approved', 'rejected', 'spam')
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (LENGTH(BTRIM(body)) BETWEEN 1 AND 5000),

    UNIQUE (id, post_id),

    FOREIGN KEY (parent_comment_id, post_id)
        REFERENCES public.post_comments(id, post_id)
        ON DELETE CASCADE
);

CREATE INDEX post_comments_post_status_idx
    ON public.post_comments(post_id, status, created_at);


-- 7.6 Reactions

CREATE TABLE public.post_reactions (
    post_id UUID NOT NULL
        REFERENCES public.posts(id) ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES neon_auth."user"(id) ON DELETE CASCADE,

    reaction TEXT NOT NULL DEFAULT 'like'
        CHECK (
            reaction IN ('like', 'love', 'useful')
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (post_id, user_id, reaction)
);

CREATE INDEX post_reactions_user_idx
    ON public.post_reactions(user_id);


-- ============================================================================
-- 8. CLIENT REQUESTS AND COLLABORATION
-- ============================================================================

-- 8.1 Main inquiry record

CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    kind TEXT NOT NULL
        CHECK (
            kind IN ('general', 'project', 'collaboration')
        ),

    name TEXT NOT NULL,
    email TEXT NOT NULL,

    subject TEXT,
    message TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'new'
        CHECK (
            status IN (
                'new',
                'reviewing',
                'in_discussion',
                'accepted',
                'declined',
                'completed',
                'closed'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (LENGTH(name) BETWEEN 1 AND 200),
    CHECK (LENGTH(email) BETWEEN 3 AND 320),
    CHECK (subject IS NULL OR LENGTH(subject) <= 300),
    CHECK (LENGTH(BTRIM(message)) BETWEEN 1 AND 10000)
);

CREATE INDEX inquiries_status_date_idx
    ON public.inquiries(status, created_at DESC);

CREATE INDEX inquiries_user_idx
    ON public.inquiries(user_id);


-- 8.2 Project request details

CREATE TABLE public.project_request_details (
    inquiry_id UUID PRIMARY KEY
        REFERENCES public.inquiries(id) ON DELETE CASCADE,

    project_type TEXT,
    project_scope TEXT,

    budget_min_minor BIGINT,
    budget_max_minor BIGINT,

    currency TEXT NOT NULL DEFAULT 'GHS'
        CHECK (currency ~ '^[A-Z]{3}$'),

    expected_by DATE,

    CHECK (project_type IS NULL OR LENGTH(project_type) <= 200),
    CHECK (project_scope IS NULL OR LENGTH(project_scope) <= 10000),

    CHECK (
        budget_min_minor IS NULL OR budget_min_minor >= 0
    ),

    CHECK (
        budget_max_minor IS NULL OR budget_max_minor >= 0
    ),

    CHECK (
        budget_min_minor IS NULL
        OR budget_max_minor IS NULL
        OR budget_max_minor >= budget_min_minor
    )
);


-- 8.3 Collaboration request details

CREATE TABLE public.collaboration_request_details (
    inquiry_id UUID PRIMARY KEY
        REFERENCES public.inquiries(id) ON DELETE CASCADE,

    collaboration_type TEXT,
    skills TEXT[],
    availability TEXT,
    proposal TEXT,

    CHECK (collaboration_type IS NULL OR LENGTH(collaboration_type) <= 200),
    CHECK (skills IS NULL OR CARDINALITY(skills) <= 50),
    CHECK (availability IS NULL OR LENGTH(availability) <= 500),
    CHECK (proposal IS NULL OR LENGTH(proposal) <= 10000)
);


-- 8.4 Inquiry messages

CREATE TABLE public.inquiry_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    inquiry_id UUID NOT NULL
        REFERENCES public.inquiries(id) ON DELETE CASCADE,

    sender_user_id UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    sender_type TEXT NOT NULL
        CHECK (
            sender_type IN ('requester', 'staff')
        ),

    message TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (LENGTH(BTRIM(message)) BETWEEN 1 AND 10000)
);

CREATE INDEX inquiry_messages_inquiry_date_idx
    ON public.inquiry_messages(inquiry_id, created_at);


-- 8.5 Inquiry attachments

CREATE TABLE public.inquiry_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    inquiry_id UUID NOT NULL
        REFERENCES public.inquiries(id) ON DELETE CASCADE,

    media_asset_id UUID NOT NULL
        REFERENCES public.media_assets(id) ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (inquiry_id, media_asset_id)
);


-- ============================================================================
-- 9. MARKETPLACE
-- ============================================================================

-- 9.1 Products

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID UNIQUE
        REFERENCES public.projects(id) ON DELETE SET NULL,

    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,

    description TEXT,

    product_type TEXT NOT NULL
        CHECK (
            product_type IN (
                'source_code',
                'hosted_software',
                'service'
            )
        ),

    pricing_model TEXT NOT NULL
        CHECK (
            pricing_model IN (
                'one_time',
                'subscription',
                'quote',
                'free'
            )
        ),

    price_amount_minor BIGINT,

    currency TEXT NOT NULL DEFAULT 'GHS'
        CHECK (currency ~ '^[A-Z]{3}$'),

    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (
            status IN ('draft', 'published', 'archived')
        ),

    published_at TIMESTAMPTZ,

    created_by UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Without a date a published product would silently never appear.
    CHECK (
        status <> 'published'
        OR published_at IS NOT NULL
    ),

    CHECK (
        price_amount_minor IS NULL
        OR price_amount_minor >= 0
    ),

    CHECK (
        pricing_model <> 'one_time'
        OR price_amount_minor IS NOT NULL
    ),

    CHECK (
        pricing_model <> 'quote'
        OR price_amount_minor IS NULL
    ),

    CHECK (
        product_type <> 'hosted_software'
        OR pricing_model = 'subscription'
    )
);

CREATE INDEX products_status_type_idx
    ON public.products(status, product_type);


-- 9.2 Product media

CREATE TABLE public.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES public.products(id) ON DELETE CASCADE,

    media_asset_id UUID NOT NULL
        REFERENCES public.media_assets(id) ON DELETE RESTRICT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (product_id, media_asset_id)
);


-- 9.3 Product plans

CREATE TABLE public.product_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES public.products(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    description TEXT,

    price_amount_minor BIGINT NOT NULL
        CHECK (price_amount_minor >= 0),

    currency TEXT NOT NULL DEFAULT 'GHS'
        CHECK (currency ~ '^[A-Z]{3}$'),

    billing_interval TEXT NOT NULL
        CHECK (
            billing_interval IN ('month', 'year')
        ),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (product_id, name)
);


-- 9.4 Private product files

CREATE TABLE public.product_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES public.products(id) ON DELETE CASCADE,

    version TEXT NOT NULL,

    storage_provider TEXT NOT NULL
        CHECK (
            storage_provider IN (
                's3_compatible',
                'private_storage'
            )
        ),

    storage_key TEXT NOT NULL,

    file_name TEXT NOT NULL,
    file_size BIGINT
        CHECK (file_size IS NULL OR file_size >= 0),

    checksum_sha256 TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    uploaded_by UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (product_id, version, file_name)
);


-- 9.5 Orders

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    buyer_email TEXT NOT NULL,

    currency TEXT NOT NULL
        CHECK (currency ~ '^[A-Z]{3}$'),

    subtotal_minor BIGINT NOT NULL
        CHECK (subtotal_minor >= 0),

    discount_minor BIGINT NOT NULL DEFAULT 0
        CHECK (discount_minor >= 0),

    total_minor BIGINT NOT NULL
        CHECK (total_minor >= 0),

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'processing',
                'paid',
                'cancelled',
                'failed',
                'partially_refunded',
                'refunded'
            )
        ),

    idempotency_key TEXT UNIQUE,

    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (discount_minor <= subtotal_minor),

    CHECK (
        status <> 'paid'
        OR paid_at IS NOT NULL
    ),

    CHECK (
        total_minor = subtotal_minor - discount_minor
    )
);

CREATE INDEX orders_user_date_idx
    ON public.orders(user_id, created_at DESC);

CREATE INDEX orders_status_date_idx
    ON public.orders(status, created_at DESC);


-- 9.6 Order items

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES public.orders(id) ON DELETE RESTRICT,

    product_id UUID
        REFERENCES public.products(id) ON DELETE SET NULL,

    product_title_snapshot TEXT NOT NULL,

    quantity INTEGER NOT NULL DEFAULT 1
        CHECK (quantity > 0),

    unit_price_minor BIGINT NOT NULL
        CHECK (unit_price_minor >= 0),

    line_total_minor BIGINT NOT NULL
        CHECK (line_total_minor >= 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        line_total_minor = quantity * unit_price_minor
    )
);

CREATE INDEX order_items_order_idx
    ON public.order_items(order_id);


-- 9.7 Payments

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES public.orders(id) ON DELETE RESTRICT,

    provider TEXT NOT NULL,
    provider_reference TEXT,

    amount_minor BIGINT NOT NULL
        CHECK (amount_minor >= 0),

    currency TEXT NOT NULL
        CHECK (currency ~ '^[A-Z]{3}$'),

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'processing',
                'succeeded',
                'failed',
                'cancelled',
                'refunded'
            )
        ),

    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (provider, provider_reference),

    CHECK (
        status <> 'succeeded'
        OR paid_at IS NOT NULL
    )
);

CREATE INDEX payments_order_idx
    ON public.payments(order_id);

CREATE INDEX payments_status_idx
    ON public.payments(status);


-- 9.8 Payment events

CREATE TABLE public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    provider TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,

    event_type TEXT NOT NULL,

    -- Store only sanitized provider event data.
    -- Never store card numbers, CVVs or authentication secrets.
    payload JSONB NOT NULL DEFAULT '{}'::JSONB,

    processed_at TIMESTAMPTZ,
    processing_error TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (provider, provider_event_id)
);


-- 9.9 Download entitlements

CREATE TABLE public.download_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_item_id UUID NOT NULL UNIQUE
        REFERENCES public.order_items(id) ON DELETE RESTRICT,

    user_id UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    guest_email TEXT,

    max_downloads INTEGER NOT NULL DEFAULT 5
        CHECK (max_downloads > 0),

    download_count INTEGER NOT NULL DEFAULT 0
        CHECK (download_count >= 0),

    expires_at TIMESTAMPTZ,

    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,

    CHECK (
        user_id IS NOT NULL
        OR guest_email IS NOT NULL
    ),

    CHECK (download_count <= max_downloads)
);

CREATE INDEX download_entitlements_user_idx
    ON public.download_entitlements(user_id);


-- 9.10 Guest download access tokens

CREATE TABLE public.download_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    entitlement_id UUID NOT NULL
        REFERENCES public.download_entitlements(id) ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only a hash of a random token is stored.
-- The original download token is never stored.


-- 9.11 Hosted software subscriptions

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,

    product_plan_id UUID NOT NULL
        REFERENCES public.product_plans(id) ON DELETE RESTRICT,

    provider TEXT NOT NULL,
    provider_subscription_id TEXT UNIQUE,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'active',
                'past_due',
                'paused',
                'cancelled',
                'expired'
            )
        ),

    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,

    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        current_period_end IS NULL
        OR current_period_start IS NULL
        OR current_period_end > current_period_start
    )
);

CREATE INDEX subscriptions_user_status_idx
    ON public.subscriptions(user_id, status);


-- ============================================================================
-- 10. WEBSITE SETTINGS AND AUDIT LOGS
-- ============================================================================

-- 10.1 Website settings

CREATE TABLE public.site_settings (
    setting_key TEXT PRIMARY KEY,

    setting_value JSONB NOT NULL DEFAULT '{}'::JSONB,

    is_public BOOLEAN NOT NULL DEFAULT FALSE,

    updated_by UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Do not store credentials or API secrets here.
-- Use Vercel environment variables for secrets.


-- 10.2 Audit logs

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    actor_user_id UUID
        REFERENCES neon_auth."user"(id) ON DELETE SET NULL,

    action TEXT NOT NULL,

    resource_type TEXT NOT NULL,
    resource_id TEXT,

    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,

    ip_hash TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_logs_actor_date_idx
    ON public.audit_logs(actor_user_id, created_at DESC);

CREATE INDEX audit_logs_resource_idx
    ON public.audit_logs(resource_type, resource_id);


-- 10.3 Foreign key indexes

-- Without these, deleting a referenced row or joining through it scans the
-- whole referencing table.

CREATE INDEX user_roles_assigned_by_idx ON public.user_roles(assigned_by);
CREATE INDEX profiles_avatar_media_idx ON public.profiles(avatar_media_id);
CREATE INDEX achievements_media_idx ON public.achievements(media_asset_id);
CREATE INDEX projects_created_by_idx ON public.projects(created_by);
CREATE INDEX project_media_media_idx ON public.project_media(media_asset_id);
CREATE INDEX project_updates_created_by_idx ON public.project_updates(created_by);
CREATE INDEX post_categories_category_idx ON public.post_categories(category_id);
CREATE INDEX post_tags_tag_idx ON public.post_tags(tag_id);
CREATE INDEX post_media_media_idx ON public.post_media(media_asset_id);
CREATE INDEX post_revisions_saved_by_idx ON public.post_revisions(saved_by);
CREATE INDEX inquiry_attachments_media_idx ON public.inquiry_attachments(media_asset_id);
CREATE INDEX post_comments_user_idx ON public.post_comments(user_id);
CREATE INDEX post_comments_parent_idx ON public.post_comments(parent_comment_id);
CREATE INDEX inquiry_messages_sender_idx ON public.inquiry_messages(sender_user_id);
CREATE INDEX products_created_by_idx ON public.products(created_by);
CREATE INDEX product_media_media_idx ON public.product_media(media_asset_id);
CREATE INDEX product_files_uploaded_by_idx ON public.product_files(uploaded_by);
CREATE INDEX order_items_product_idx ON public.order_items(product_id);
CREATE INDEX subscriptions_plan_idx ON public.subscriptions(product_plan_id);
CREATE INDEX download_access_tokens_entitlement_idx ON public.download_access_tokens(entitlement_id);
CREATE INDEX site_settings_updated_by_idx ON public.site_settings(updated_by);


-- ============================================================================
-- 11. UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION app_private.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.set_updated_at() FROM PUBLIC;

DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'profiles',
        'newsletter_subscribers',
        'social_links',
        'media_assets',
        'achievements',
        'projects',
        'project_updates',
        'posts',
        'post_comments',
        'inquiries',
        'products',
        'product_plans',
        'orders',
        'payments',
        'subscriptions',
        'site_settings'
    ]
    LOOP
        EXECUTE FORMAT(
            'CREATE TRIGGER %I
             BEFORE UPDATE ON public.%I
             FOR EACH ROW
             EXECUTE FUNCTION app_private.set_updated_at()',
            table_name || '_updated_at',
            table_name
        );
    END LOOP;
END;
$$;


-- ============================================================================
-- 12. DOWNLOAD ENTITLEMENT VALIDATION
-- ============================================================================

-- This prevents the creation of a download entitlement before
-- the related order has actually been marked paid.
--
-- Order payment verification must still happen in trusted,
-- server-side payment processing.

CREATE OR REPLACE FUNCTION app_private.validate_download_entitlement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    related_order_status TEXT;
    related_order_user_id UUID;
    related_order_email TEXT;
BEGIN
    SELECT o.status, o.user_id, o.buyer_email
    INTO related_order_status, related_order_user_id, related_order_email
    FROM public.order_items AS oi
    JOIN public.orders AS o
      ON o.id = oi.order_id
    WHERE oi.id = NEW.order_item_id;

    -- The buyer's account is being deleted. This must never block deletion,
    -- whatever the order's status now is. The purchase stays tied to the
    -- email it was bought with.
    IF TG_OP = 'UPDATE'
       AND NEW.order_item_id = OLD.order_item_id
       AND NEW.user_id IS NULL THEN
        NEW.guest_email = COALESCE(NEW.guest_email, related_order_email);
        RETURN NEW;
    END IF;

    IF related_order_status IS DISTINCT FROM 'paid' THEN
        RAISE EXCEPTION
            'A download entitlement requires a paid order';
    END IF;

    IF NEW.user_id IS NOT NULL
       AND NEW.user_id IS DISTINCT FROM related_order_user_id THEN
        RAISE EXCEPTION
            'Entitlement user must own the paid order';
    END IF;

    IF NEW.guest_email IS NOT NULL
       AND LOWER(NEW.guest_email) <> LOWER(related_order_email) THEN
        RAISE EXCEPTION
            'Entitlement email must match the paid order';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION
    app_private.validate_download_entitlement()
FROM PUBLIC;

-- Fires only when the entitlement is created or re-pointed. Counting a
-- download or setting revoked_at must keep working after a refund.
CREATE TRIGGER validate_download_entitlement
BEFORE INSERT OR UPDATE OF order_item_id, user_id
ON public.download_entitlements
FOR EACH ROW
EXECUTE FUNCTION app_private.validate_download_entitlement();


-- 12.1 Comments cannot be moved

-- A comment stays on the post and thread it was written on. Without this,
-- an author could move a pending comment onto a post with comments disabled.

CREATE OR REPLACE FUNCTION app_private.keep_comment_in_place()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF NEW.post_id IS DISTINCT FROM OLD.post_id
       OR NEW.parent_comment_id IS DISTINCT FROM OLD.parent_comment_id THEN
        RAISE EXCEPTION
            'A comment cannot be moved to another post or thread';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.keep_comment_in_place() FROM PUBLIC;

CREATE TRIGGER keep_comment_in_place
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION app_private.keep_comment_in_place();


-- 12.2 Client attachments stay private

-- media_assets defaults to public, so an attachment saved with the default
-- would otherwise be readable by anyone.

CREATE OR REPLACE FUNCTION app_private.require_private_attachment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.media_assets AS m
        WHERE m.id = NEW.media_asset_id
          AND m.visibility = 'private'
    ) THEN
        RAISE EXCEPTION 'Inquiry attachments must be private media';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.require_private_attachment() FROM PUBLIC;

CREATE TRIGGER require_private_attachment
BEFORE INSERT OR UPDATE ON public.inquiry_attachments
FOR EACH ROW
EXECUTE FUNCTION app_private.require_private_attachment();

CREATE OR REPLACE FUNCTION app_private.keep_attachment_private()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NEW.visibility <> 'private' AND EXISTS (
        SELECT 1
        FROM public.inquiry_attachments AS ia
        WHERE ia.media_asset_id = NEW.id
    ) THEN
        RAISE EXCEPTION 'Inquiry attachments must be private media';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.keep_attachment_private() FROM PUBLIC;

CREATE TRIGGER keep_attachment_private
BEFORE UPDATE OF visibility ON public.media_assets
FOR EACH ROW
EXECUTE FUNCTION app_private.keep_attachment_private();


-- 12.3 Attachment lookup for policies

-- SECURITY DEFINER because inquiry_attachments RLS would hide the row from the
-- very editors this check exists to exclude.

CREATE OR REPLACE FUNCTION app_private.is_inquiry_attachment(
    asset_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.inquiry_attachments AS ia
        WHERE ia.media_asset_id = asset_id
    );
$$;

REVOKE ALL ON FUNCTION app_private.is_inquiry_attachment(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app_private.is_inquiry_attachment(UUID)
TO authenticated;


-- ============================================================================
-- 13. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_request_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_request_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiry_attachments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 14. ROLE POLICIES
-- ============================================================================

CREATE POLICY user_roles_read_own
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    user_id = app_private.current_user_id()
    OR app_private.is_admin()
);

CREATE POLICY user_roles_owner_manage
ON public.user_roles
FOR ALL
TO authenticated
USING (app_private.is_owner())
WITH CHECK (app_private.is_owner());


-- ============================================================================
-- 15. PROFILE AND COMMUNITY POLICIES
-- ============================================================================

CREATE POLICY profiles_public_read
ON public.profiles
FOR SELECT
TO anonymous, authenticated
USING (is_public = TRUE);

CREATE POLICY profiles_authenticated_read
ON public.profiles
FOR SELECT
TO authenticated
USING (
    user_id = app_private.current_user_id()
    OR app_private.is_admin()
);

CREATE POLICY profiles_insert_own
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = app_private.current_user_id());

CREATE POLICY profiles_update_own
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = app_private.current_user_id())
WITH CHECK (user_id = app_private.current_user_id());

CREATE POLICY profiles_admin_manage
ON public.profiles
FOR ALL
TO authenticated
USING (app_private.is_admin())
WITH CHECK (app_private.is_admin());


CREATE POLICY follows_public_read
ON public.follows
FOR SELECT
TO anonymous, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles AS follower
        WHERE follower.user_id = follower_id
          AND follower.is_public = TRUE
    )
    AND EXISTS (
        SELECT 1
        FROM public.profiles AS followed
        WHERE followed.user_id = followed_id
          AND followed.is_public = TRUE
    )
);

-- Needed to unfollow: DELETE only reaches rows the user can also read, and
-- follows_public_read hides a follow once either profile is private or missing.
CREATE POLICY follows_read_own
ON public.follows
FOR SELECT
TO authenticated
USING (follower_id = app_private.current_user_id());

CREATE POLICY follows_insert_own
ON public.follows
FOR INSERT
TO authenticated
WITH CHECK (
    follower_id = app_private.current_user_id()
    AND followed_id <> app_private.current_user_id()
    AND EXISTS (
        SELECT 1
        FROM public.profiles AS target_profile
        WHERE target_profile.user_id = followed_id
          AND target_profile.is_public = TRUE
    )
);

CREATE POLICY follows_delete_own
ON public.follows
FOR DELETE
TO authenticated
USING (follower_id = app_private.current_user_id());


CREATE POLICY newsletter_admin_manage
ON public.newsletter_subscribers
FOR ALL
TO authenticated
USING (app_private.is_admin())
WITH CHECK (app_private.is_admin());


CREATE POLICY social_links_public_read
ON public.social_links
FOR SELECT
TO anonymous, authenticated
USING (is_visible = TRUE);

CREATE POLICY social_links_admin_manage
ON public.social_links
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


-- ============================================================================
-- 16. MEDIA AND ACHIEVEMENT POLICIES
-- ============================================================================

CREATE POLICY media_public_read
ON public.media_assets
FOR SELECT
TO anonymous, authenticated
USING (
    visibility = 'public'
    AND status = 'ready'
);

-- Editors manage site media, but client attachments stay with inquiry staff.
CREATE POLICY media_admin_manage
ON public.media_assets
FOR ALL
TO authenticated
USING (
    app_private.can_manage_content()
    AND (
        app_private.can_manage_inquiries()
        OR NOT app_private.is_inquiry_attachment(id)
    )
)
WITH CHECK (app_private.can_manage_content());


CREATE POLICY achievements_public_read
ON public.achievements
FOR SELECT
TO anonymous, authenticated
USING (is_published = TRUE);

CREATE POLICY achievements_admin_manage
ON public.achievements
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


-- ============================================================================
-- 17. PROJECT POLICIES
-- ============================================================================

CREATE POLICY projects_public_read
ON public.projects
FOR SELECT
TO anonymous, authenticated
USING (
    visibility = 'public'
    AND lifecycle_status <> 'archived'
    AND published_at IS NOT NULL
    AND published_at <= NOW()
);

CREATE POLICY projects_admin_manage
ON public.projects
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY technologies_public_read
ON public.technologies
FOR SELECT
TO anonymous, authenticated
USING (TRUE);

CREATE POLICY technologies_admin_manage
ON public.technologies
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY project_technologies_public_read
ON public.project_technologies
FOR SELECT
TO anonymous, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.projects AS p
        WHERE p.id = project_id
          AND p.visibility = 'public'
          AND p.lifecycle_status <> 'archived'
          AND p.published_at <= NOW()
    )
);

CREATE POLICY project_technologies_admin_manage
ON public.project_technologies
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY project_media_public_read
ON public.project_media
FOR SELECT
TO anonymous, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.projects AS p
        WHERE p.id = project_id
          AND p.visibility = 'public'
          AND p.lifecycle_status <> 'archived'
          AND p.published_at <= NOW()
    )
    AND EXISTS (
        SELECT 1
        FROM public.media_assets AS m
        WHERE m.id = media_asset_id
          AND m.visibility = 'public'
          AND m.status = 'ready'
    )
);

CREATE POLICY project_media_admin_manage
ON public.project_media
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY project_updates_public_read
ON public.project_updates
FOR SELECT
TO anonymous, authenticated
USING (
    visibility = 'public'
    AND EXISTS (
        SELECT 1
        FROM public.projects AS p
        WHERE p.id = project_id
          AND p.visibility = 'public'
          AND p.lifecycle_status <> 'archived'
          AND p.published_at <= NOW()
    )
);

CREATE POLICY project_updates_admin_manage
ON public.project_updates
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


-- ============================================================================
-- 18. PUBLISHING POLICIES
-- ============================================================================

CREATE POLICY posts_public_read
ON public.posts
FOR SELECT
TO anonymous, authenticated
USING (
    status = 'published'
    AND published_at IS NOT NULL
    AND published_at <= NOW()
);

CREATE POLICY posts_admin_manage
ON public.posts
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY categories_public_read
ON public.categories
FOR SELECT
TO anonymous, authenticated
USING (is_active = TRUE);

CREATE POLICY categories_admin_manage
ON public.categories
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY post_categories_public_read
ON public.post_categories
FOR SELECT
TO anonymous, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.posts AS p
        WHERE p.id = post_id
          AND p.status = 'published'
          AND p.published_at <= NOW()
    )
);

CREATE POLICY post_categories_admin_manage
ON public.post_categories
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY tags_public_read
ON public.tags
FOR SELECT
TO anonymous, authenticated
USING (TRUE);

CREATE POLICY tags_admin_manage
ON public.tags
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY post_tags_public_read
ON public.post_tags
FOR SELECT
TO anonymous, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.posts AS p
        WHERE p.id = post_id
          AND p.status = 'published'
          AND p.published_at <= NOW()
    )
);

CREATE POLICY post_tags_admin_manage
ON public.post_tags
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY post_media_public_read
ON public.post_media
FOR SELECT
TO anonymous, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.posts AS p
        WHERE p.id = post_id
          AND p.status = 'published'
          AND p.published_at <= NOW()
    )
    AND EXISTS (
        SELECT 1
        FROM public.media_assets AS m
        WHERE m.id = media_asset_id
          AND m.visibility = 'public'
          AND m.status = 'ready'
    )
);

CREATE POLICY post_media_admin_manage
ON public.post_media
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY post_revisions_admin_manage
ON public.post_revisions
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


-- ============================================================================
-- 19. COMMENT AND REACTION POLICIES
-- ============================================================================

CREATE POLICY post_comments_public_read
ON public.post_comments
FOR SELECT
TO anonymous, authenticated
USING (
    status = 'approved'
    AND EXISTS (
        SELECT 1
        FROM public.posts AS p
        WHERE p.id = post_id
          AND p.status = 'published'
          AND p.published_at <= NOW()
          AND p.allow_comments = TRUE
    )
);

CREATE POLICY post_comments_user_read_own
ON public.post_comments
FOR SELECT
TO authenticated
USING (user_id = app_private.current_user_id());

CREATE POLICY post_comments_user_insert
ON public.post_comments
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = app_private.current_user_id()
    AND status = 'pending'
    AND EXISTS (
        SELECT 1
        FROM public.posts AS p
        WHERE p.id = post_id
          AND p.status = 'published'
          AND p.published_at <= NOW()
          AND p.allow_comments = TRUE
    )
);

CREATE POLICY post_comments_user_update_own_pending
ON public.post_comments
FOR UPDATE
TO authenticated
USING (
    user_id = app_private.current_user_id()
    AND status = 'pending'
)
WITH CHECK (
    user_id = app_private.current_user_id()
    AND status = 'pending'
);

CREATE POLICY post_comments_admin_manage
ON public.post_comments
FOR ALL
TO authenticated
USING (app_private.can_manage_content())
WITH CHECK (app_private.can_manage_content());


CREATE POLICY post_reactions_public_read
ON public.post_reactions
FOR SELECT
TO anonymous, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.posts AS p
        WHERE p.id = post_id
          AND p.status = 'published'
          AND p.published_at <= NOW()
    )
);

CREATE POLICY post_reactions_user_insert
ON public.post_reactions
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = app_private.current_user_id()
    AND EXISTS (
        SELECT 1
        FROM public.posts AS p
        WHERE p.id = post_id
          AND p.status = 'published'
          AND p.published_at <= NOW()
    )
);

CREATE POLICY post_reactions_user_delete
ON public.post_reactions
FOR DELETE
TO authenticated
USING (user_id = app_private.current_user_id());


-- ============================================================================
-- 20. INQUIRY AND COLLABORATION POLICIES
-- ============================================================================

-- Guest submission is server-side only.
-- Authenticated users can read only their own requests.

CREATE POLICY inquiries_user_read_own
ON public.inquiries
FOR SELECT
TO authenticated
USING (
    user_id = app_private.current_user_id()
    OR app_private.can_manage_inquiries()
);

CREATE POLICY inquiries_admin_manage
ON public.inquiries
FOR ALL
TO authenticated
USING (app_private.can_manage_inquiries())
WITH CHECK (app_private.can_manage_inquiries());

CREATE POLICY inquiries_user_insert
ON public.inquiries
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = app_private.current_user_id()
    AND status = 'new'
);


CREATE POLICY project_request_details_user_read
ON public.project_request_details
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.inquiries AS i
        WHERE i.id = inquiry_id
          AND i.user_id = app_private.current_user_id()
    )
);

CREATE POLICY project_request_details_user_insert
ON public.project_request_details
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.inquiries AS i
        WHERE i.id = inquiry_id
          AND i.user_id = app_private.current_user_id()
          AND i.kind = 'project'
    )
);

CREATE POLICY project_request_details_admin_manage
ON public.project_request_details
FOR ALL
TO authenticated
USING (app_private.can_manage_inquiries())
WITH CHECK (app_private.can_manage_inquiries());


CREATE POLICY collaboration_request_details_user_read
ON public.collaboration_request_details
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.inquiries AS i
        WHERE i.id = inquiry_id
          AND i.user_id = app_private.current_user_id()
    )
);

CREATE POLICY collaboration_request_details_user_insert
ON public.collaboration_request_details
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.inquiries AS i
        WHERE i.id = inquiry_id
          AND i.user_id = app_private.current_user_id()
          AND i.kind = 'collaboration'
    )
);

CREATE POLICY collaboration_request_details_admin_manage
ON public.collaboration_request_details
FOR ALL
TO authenticated
USING (app_private.can_manage_inquiries())
WITH CHECK (app_private.can_manage_inquiries());


CREATE POLICY inquiry_messages_user_read
ON public.inquiry_messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.inquiries AS i
        WHERE i.id = inquiry_id
          AND i.user_id = app_private.current_user_id()
    )
);

-- Requesters can only post as themselves, never as staff.
CREATE POLICY inquiry_messages_user_insert
ON public.inquiry_messages
FOR INSERT
TO authenticated
WITH CHECK (
    sender_user_id = app_private.current_user_id()
    AND sender_type = 'requester'
    AND EXISTS (
        SELECT 1
        FROM public.inquiries AS i
        WHERE i.id = inquiry_id
          AND i.user_id = app_private.current_user_id()
    )
);

CREATE POLICY inquiry_messages_admin_manage
ON public.inquiry_messages
FOR ALL
TO authenticated
USING (app_private.can_manage_inquiries())
WITH CHECK (app_private.can_manage_inquiries());


CREATE POLICY inquiry_attachments_user_read
ON public.inquiry_attachments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.inquiries AS i
        WHERE i.id = inquiry_id
          AND i.user_id = app_private.current_user_id()
    )
);

CREATE POLICY inquiry_attachments_admin_manage
ON public.inquiry_attachments
FOR ALL
TO authenticated
USING (app_private.can_manage_inquiries())
WITH CHECK (app_private.can_manage_inquiries());


-- Private attachment metadata is visible to the inquiry's requester and to
-- support staff. media_admin_manage alone would exclude the support role.
CREATE POLICY media_inquiry_attachment_read
ON public.media_assets
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.inquiry_attachments AS ia
        WHERE ia.media_asset_id = media_assets.id
    )
);


-- ============================================================================
-- 21. MARKETPLACE POLICIES
-- ============================================================================

-- Orders, payments, entitlements and subscriptions are written only by trusted
-- server-side payment processing, which connects with its own database role.
-- No browser-facing role, including admin, can write them through the Data API.

CREATE POLICY products_public_read
ON public.products
FOR SELECT
TO anonymous, authenticated
USING (
    status = 'published'
    AND published_at IS NOT NULL
    AND published_at <= NOW()
);

CREATE POLICY products_admin_manage
ON public.products
FOR ALL
TO authenticated
USING (app_private.can_manage_commerce())
WITH CHECK (app_private.can_manage_commerce());


CREATE POLICY product_media_public_read
ON public.product_media
FOR SELECT
TO anonymous, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.products AS p
        WHERE p.id = product_id
          AND p.status = 'published'
          AND p.published_at <= NOW()
    )
    AND EXISTS (
        SELECT 1
        FROM public.media_assets AS m
        WHERE m.id = media_asset_id
          AND m.visibility = 'public'
          AND m.status = 'ready'
    )
);

CREATE POLICY product_media_admin_manage
ON public.product_media
FOR ALL
TO authenticated
USING (app_private.can_manage_commerce())
WITH CHECK (app_private.can_manage_commerce());


CREATE POLICY product_plans_public_read
ON public.product_plans
FOR SELECT
TO anonymous, authenticated
USING (
    is_active = TRUE
    AND EXISTS (
        SELECT 1
        FROM public.products AS p
        WHERE p.id = product_id
          AND p.status = 'published'
          AND p.published_at <= NOW()
    )
);

CREATE POLICY product_plans_admin_manage
ON public.product_plans
FOR ALL
TO authenticated
USING (app_private.can_manage_commerce())
WITH CHECK (app_private.can_manage_commerce());


-- Buyers never read this table. The server checks the entitlement and then
-- issues a short-lived signed download URL.
CREATE POLICY product_files_admin_manage
ON public.product_files
FOR ALL
TO authenticated
USING (app_private.can_manage_commerce())
WITH CHECK (app_private.can_manage_commerce());


CREATE POLICY orders_read
ON public.orders
FOR SELECT
TO authenticated
USING (
    user_id = app_private.current_user_id()
    OR app_private.can_manage_commerce()
);

CREATE POLICY order_items_read
ON public.order_items
FOR SELECT
TO authenticated
USING (
    app_private.can_manage_commerce()
    OR EXISTS (
        SELECT 1
        FROM public.orders AS o
        WHERE o.id = order_id
          AND o.user_id = app_private.current_user_id()
    )
);

CREATE POLICY payments_read
ON public.payments
FOR SELECT
TO authenticated
USING (
    app_private.can_manage_commerce()
    OR EXISTS (
        SELECT 1
        FROM public.orders AS o
        WHERE o.id = order_id
          AND o.user_id = app_private.current_user_id()
    )
);

CREATE POLICY payment_events_admin_read
ON public.payment_events
FOR SELECT
TO authenticated
USING (app_private.can_manage_commerce());

CREATE POLICY download_entitlements_read
ON public.download_entitlements
FOR SELECT
TO authenticated
USING (
    user_id = app_private.current_user_id()
    OR app_private.can_manage_commerce()
);

-- download_access_tokens has RLS enabled and no policies on purpose:
-- only trusted server-side code can touch it.

CREATE POLICY subscriptions_read
ON public.subscriptions
FOR SELECT
TO authenticated
USING (
    user_id = app_private.current_user_id()
    OR app_private.can_manage_commerce()
);


-- ============================================================================
-- 22. SETTINGS AND AUDIT POLICIES
-- ============================================================================

CREATE POLICY site_settings_public_read
ON public.site_settings
FOR SELECT
TO anonymous, authenticated
USING (is_public = TRUE);

CREATE POLICY site_settings_admin_manage
ON public.site_settings
FOR ALL
TO authenticated
USING (app_private.is_admin())
WITH CHECK (app_private.is_admin());

-- Audit logs are append-only from trusted server-side code.
CREATE POLICY audit_logs_admin_read
ON public.audit_logs
FOR SELECT
TO authenticated
USING (app_private.is_admin());


-- ============================================================================
-- 23. TABLE PERMISSIONS
-- ============================================================================

-- RLS filters rows, but a role also needs table privileges to reach them.
-- Row access is still decided by the policies above.

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
TO anonymous;

GRANT SELECT, INSERT, UPDATE, DELETE ON
    public.user_roles,
    public.profiles,
    public.follows,
    public.newsletter_subscribers,
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
    public.post_revisions,
    public.post_comments,
    public.post_reactions,
    public.inquiries,
    public.project_request_details,
    public.collaboration_request_details,
    public.inquiry_messages,
    public.inquiry_attachments,
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
-- 24. FIRST OWNER (RUN MANUALLY)
-- ============================================================================

-- No one can assign roles until an owner exists. After signing up, run this
-- once from the Neon SQL editor with your own Neon Auth user ID:
--
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<your-neon-auth-user-id>', 'owner');


COMMIT;
