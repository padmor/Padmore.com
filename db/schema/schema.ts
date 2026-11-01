import { pgSchema, pgTable, index, foreignKey, unique, pgPolicy, check, uuid, text, boolean, date, timestamp, jsonb, bigint, uniqueIndex, integer, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



// Owned by Neon Auth. Declared only so that foreign keys can reference it.
export const user = pgSchema("neon_auth").table("user", { id: uuid().primaryKey() });

export const projects = pgTable("projects", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	summary: text(),
	description: text(),
	lifecycleStatus: text("lifecycle_status").default('idea').notNull(),
	visibility: text().default('draft').notNull(),
	isTested: boolean("is_tested").default(false).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	demoUrl: text("demo_url"),
	repositoryUrl: text("repository_url"),
	startedOn: date("started_on"),
	completedOn: date("completed_on"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	projectType: text("project_type"),
	category: text(),
	artwork: text().default('portfolio').notNull(),
}, (table) => [
	index("projects_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("projects_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("projects_featured_idx").using("btree", table.isFeatured.asc().nullsLast().op("bool_ops")).where(sql`(is_featured = true)`),
	index("projects_status_idx").using("btree", table.lifecycleStatus.asc().nullsLast().op("text_ops")),
	index("projects_visibility_date_idx").using("btree", table.visibility.asc().nullsLast().op("text_ops"), table.publishedAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "projects_created_by_fkey"
		}).onDelete("set null"),
	unique("projects_slug_key").on(table.slug),
	pgPolicy("projects_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("projects_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("projects_artwork_check", sql`artwork = ANY (ARRAY['commerce'::text, 'tasks'::text, 'portfolio'::text, 'weather'::text, 'study'::text, 'chat'::text])`),
	check("projects_check", sql`(completed_on IS NULL) OR (started_on IS NULL) OR (completed_on >= started_on)`),
	check("projects_lifecycle_status_check", sql`lifecycle_status = ANY (ARRAY['idea'::text, 'planning'::text, 'in_progress'::text, 'testing'::text, 'beta'::text, 'live'::text, 'paused'::text, 'completed'::text, 'archived'::text])`),
	check("projects_slug_check", sql`slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text`),
	check("projects_visibility_check", sql`visibility = ANY (ARRAY['draft'::text, 'public'::text, 'private'::text])`),
]);

export const achievements = pgTable("achievements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	organization: text(),
	credentialUrl: text("credential_url"),
	achievedOn: date("achieved_on"),
	mediaAssetId: uuid("media_asset_id"),
	isPublished: boolean("is_published").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	icon: text(),
}, (table) => [
	index("achievements_media_idx").using("btree", table.mediaAssetId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.mediaAssetId],
			foreignColumns: [mediaAssets.id],
			name: "achievements_media_asset_id_fkey"
		}).onDelete("set null"),
	pgPolicy("achievements_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("achievements_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("achievements_icon_check", sql`(icon IS NULL) OR (length(icon) <= 8)`),
]);

export const userRoles = pgTable("user_roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	role: text().notNull(),
	assignedBy: uuid("assigned_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_roles_assigned_by_idx").using("btree", table.assignedBy.asc().nullsLast().op("uuid_ops")),
	index("user_roles_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [user.id],
			name: "user_roles_assigned_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_roles_user_id_fkey"
		}).onDelete("cascade"),
	unique("user_roles_user_id_role_key").on(table.role, table.userId),
	pgPolicy("user_roles_read_own", { as: "permissive", for: "select", to: ["authenticated"], using: sql`((user_id = app_private.current_user_id()) OR app_private.is_admin())` }),
	pgPolicy("user_roles_owner_manage", { as: "permissive", for: "all", to: ["authenticated"] }),
	check("user_roles_role_check", sql`role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text, 'support'::text])`),
]);

export const postRevisions = pgTable("post_revisions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	savedBy: uuid("saved_by"),
	titleSnapshot: text("title_snapshot").notNull(),
	excerptSnapshot: text("excerpt_snapshot"),
	contentSnapshot: jsonb("content_snapshot").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("post_revisions_post_date_idx").using("btree", table.postId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("post_revisions_saved_by_idx").using("btree", table.savedBy.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_revisions_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.savedBy],
			foreignColumns: [user.id],
			name: "post_revisions_saved_by_fkey"
		}).onDelete("set null"),
	pgPolicy("post_revisions_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
]);

export const inquiryMessages = pgTable("inquiry_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	inquiryId: uuid("inquiry_id").notNull(),
	senderUserId: uuid("sender_user_id"),
	senderType: text("sender_type").notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inquiry_messages_inquiry_date_idx").using("btree", table.inquiryId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("inquiry_messages_sender_idx").using("btree", table.senderUserId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.inquiryId],
			foreignColumns: [inquiries.id],
			name: "inquiry_messages_inquiry_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.senderUserId],
			foreignColumns: [user.id],
			name: "inquiry_messages_sender_user_id_fkey"
		}).onDelete("set null"),
	pgPolicy("inquiry_messages_user_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM inquiries i
  WHERE ((i.id = inquiry_messages.inquiry_id) AND (i.user_id = app_private.current_user_id()))))` }),
	pgPolicy("inquiry_messages_user_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("inquiry_messages_admin_manage", { as: "permissive", for: "all", to: ["authenticated"] }),
	check("inquiry_messages_message_check", sql`(length(btrim(message)) >= 1) AND (length(btrim(message)) <= 10000)`),
	check("inquiry_messages_sender_type_check", sql`sender_type = ANY (ARRAY['requester'::text, 'staff'::text])`),
]);

export const inquiryAttachments = pgTable("inquiry_attachments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	inquiryId: uuid("inquiry_id").notNull(),
	mediaAssetId: uuid("media_asset_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inquiry_attachments_media_idx").using("btree", table.mediaAssetId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.inquiryId],
			foreignColumns: [inquiries.id],
			name: "inquiry_attachments_inquiry_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mediaAssetId],
			foreignColumns: [mediaAssets.id],
			name: "inquiry_attachments_media_asset_id_fkey"
		}).onDelete("restrict"),
	unique("inquiry_attachments_inquiry_id_media_asset_id_key").on(table.inquiryId, table.mediaAssetId),
	pgPolicy("inquiry_attachments_user_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM inquiries i
  WHERE ((i.id = inquiry_attachments.inquiry_id) AND (i.user_id = app_private.current_user_id()))))` }),
	pgPolicy("inquiry_attachments_admin_manage", { as: "permissive", for: "all", to: ["authenticated"] }),
]);

export const inquiryClaimTokens = pgTable("inquiry_claim_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	inquiryId: uuid("inquiry_id").notNull(),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	usedAt: timestamp("used_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inquiry_claim_tokens_inquiry_idx").using("btree", table.inquiryId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.inquiryId],
			foreignColumns: [inquiries.id],
			name: "inquiry_claim_tokens_inquiry_id_fkey"
		}).onDelete("cascade"),
	unique("inquiry_claim_tokens_token_hash_key").on(table.tokenHash),
	pgPolicy("inquiry_claim_tokens_server_access", { as: "permissive", for: "all", to: ["app_server"], using: sql`true`, withCheck: sql`true`  }),
]);

export const projectRequestDetails = pgTable("project_request_details", {
	inquiryId: uuid("inquiry_id").primaryKey().notNull(),
	projectType: text("project_type"),
	projectScope: text("project_scope"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	budgetMinMinor: bigint("budget_min_minor", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	budgetMaxMinor: bigint("budget_max_minor", { mode: "number" }),
	currency: text().default('GHS').notNull(),
	expectedBy: date("expected_by"),
}, (table) => [
	foreignKey({
			columns: [table.inquiryId],
			foreignColumns: [inquiries.id],
			name: "project_request_details_inquiry_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("project_request_details_user_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM inquiries i
  WHERE ((i.id = project_request_details.inquiry_id) AND (i.user_id = app_private.current_user_id()))))` }),
	pgPolicy("project_request_details_user_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("project_request_details_admin_manage", { as: "permissive", for: "all", to: ["authenticated"] }),
	pgPolicy("project_request_details_server_insert", { as: "permissive", for: "insert", to: ["app_server"] }),
	check("project_request_details_budget_max_minor_check", sql`(budget_max_minor IS NULL) OR (budget_max_minor >= 0)`),
	check("project_request_details_budget_min_minor_check", sql`(budget_min_minor IS NULL) OR (budget_min_minor >= 0)`),
	check("project_request_details_check", sql`(budget_min_minor IS NULL) OR (budget_max_minor IS NULL) OR (budget_max_minor >= budget_min_minor)`),
	check("project_request_details_currency_check", sql`currency ~ '^[A-Z]{3}$'::text`),
	check("project_request_details_project_scope_check", sql`(project_scope IS NULL) OR (length(project_scope) <= 10000)`),
	check("project_request_details_project_type_check", sql`(project_type IS NULL) OR (length(project_type) <= 200)`),
]);

export const collaborationRequestDetails = pgTable("collaboration_request_details", {
	inquiryId: uuid("inquiry_id").primaryKey().notNull(),
	collaborationType: text("collaboration_type"),
	skills: text().array(),
	availability: text(),
	proposal: text(),
}, (table) => [
	foreignKey({
			columns: [table.inquiryId],
			foreignColumns: [inquiries.id],
			name: "collaboration_request_details_inquiry_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("collaboration_request_details_user_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(EXISTS ( SELECT 1
   FROM inquiries i
  WHERE ((i.id = collaboration_request_details.inquiry_id) AND (i.user_id = app_private.current_user_id()))))` }),
	pgPolicy("collaboration_request_details_user_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("collaboration_request_details_admin_manage", { as: "permissive", for: "all", to: ["authenticated"] }),
	pgPolicy("collaboration_request_details_server_insert", { as: "permissive", for: "insert", to: ["app_server"] }),
	check("collaboration_request_details_availability_check", sql`(availability IS NULL) OR (length(availability) <= 500)`),
	check("collaboration_request_details_collaboration_type_check", sql`(collaboration_type IS NULL) OR (length(collaboration_type) <= 200)`),
	check("collaboration_request_details_proposal_check", sql`(proposal IS NULL) OR (length(proposal) <= 10000)`),
	check("collaboration_request_details_skills_check", sql`(skills IS NULL) OR (cardinality(skills) <= 50)`),
]);

export const auditLogs = pgTable("audit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	actorUserId: uuid("actor_user_id"),
	action: text().notNull(),
	resourceType: text("resource_type").notNull(),
	resourceId: text("resource_id"),
	metadata: jsonb().default({}).notNull(),
	ipHash: text("ip_hash"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("audit_logs_actor_date_idx").using("btree", table.actorUserId.asc().nullsLast().op("uuid_ops"), table.createdAt.desc().nullsFirst().op("uuid_ops")),
	index("audit_logs_resource_idx").using("btree", table.resourceType.asc().nullsLast().op("text_ops"), table.resourceId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.actorUserId],
			foreignColumns: [user.id],
			name: "audit_logs_actor_user_id_fkey"
		}).onDelete("set null"),
	pgPolicy("audit_logs_admin_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`app_private.is_admin()` }),
	pgPolicy("audit_logs_server_insert", { as: "permissive", for: "insert", to: ["app_server"] }),
]);

export const inquiries = pgTable("inquiries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	kind: text().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	subject: text(),
	message: text().notNull(),
	status: text().default('new').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inquiries_status_date_idx").using("btree", table.status.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("inquiries_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "inquiries_user_id_fkey"
		}).onDelete("set null"),
	pgPolicy("inquiries_user_insert", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`((user_id = app_private.current_user_id()) AND (status = 'new'::text))`  }),
	pgPolicy("inquiries_user_read_own", { as: "permissive", for: "select", to: ["authenticated"] }),
	pgPolicy("inquiries_admin_manage", { as: "permissive", for: "all", to: ["authenticated"] }),
	pgPolicy("inquiries_server_guest_insert", { as: "permissive", for: "insert", to: ["app_server"] }),
	pgPolicy("inquiries_server_guest_read", { as: "permissive", for: "select", to: ["app_server"] }),
	check("inquiries_email_check", sql`(length(email) >= 3) AND (length(email) <= 320)`),
	check("inquiries_kind_check", sql`kind = ANY (ARRAY['general'::text, 'project'::text, 'collaboration'::text])`),
	check("inquiries_message_check", sql`(length(btrim(message)) >= 1) AND (length(btrim(message)) <= 10000)`),
	check("inquiries_name_check", sql`(length(name) >= 1) AND (length(name) <= 200)`),
	check("inquiries_status_check", sql`status = ANY (ARRAY['new'::text, 'reviewing'::text, 'in_discussion'::text, 'accepted'::text, 'declined'::text, 'completed'::text, 'closed'::text])`),
	check("inquiries_subject_check", sql`(subject IS NULL) OR (length(subject) <= 300)`),
]);

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	status: text().default('pending').notNull(),
	source: text(),
	confirmationTokenHash: text("confirmation_token_hash"),
	confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: 'string' }),
	unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("newsletter_email_lower_idx").using("btree", sql`lower(email)`),
	pgPolicy("newsletter_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.is_admin()`, withCheck: sql`app_private.is_admin()`  }),
	pgPolicy("newsletter_subscribers_server_access", { as: "permissive", for: "all", to: ["app_server"] }),
	check("newsletter_subscribers_status_check", sql`status = ANY (ARRAY['pending'::text, 'active'::text, 'unsubscribed'::text])`),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	buyerEmail: text("buyer_email").notNull(),
	currency: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	discountMinor: bigint("discount_minor", { mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
	status: text().default('pending').notNull(),
	idempotencyKey: text("idempotency_key"),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("orders_status_date_idx").using("btree", table.status.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("orders_user_date_idx").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "orders_user_id_fkey"
		}).onDelete("set null"),
	unique("orders_idempotency_key_key").on(table.idempotencyKey),
	pgPolicy("orders_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`((user_id = app_private.current_user_id()) OR app_private.can_manage_commerce())` }),
	pgPolicy("orders_server_access", { as: "permissive", for: "all", to: ["app_server"] }),
	check("orders_check", sql`discount_minor <= subtotal_minor`),
	check("orders_check1", sql`(status <> 'paid'::text) OR (paid_at IS NOT NULL)`),
	check("orders_check2", sql`total_minor = (subtotal_minor - discount_minor)`),
	check("orders_currency_check", sql`currency ~ '^[A-Z]{3}$'::text`),
	check("orders_discount_minor_check", sql`discount_minor >= 0`),
	check("orders_status_check", sql`status = ANY (ARRAY['pending'::text, 'processing'::text, 'paid'::text, 'cancelled'::text, 'failed'::text, 'partially_refunded'::text, 'refunded'::text])`),
	check("orders_subtotal_minor_check", sql`subtotal_minor >= 0`),
	check("orders_total_minor_check", sql`total_minor >= 0`),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	provider: text().notNull(),
	providerReference: text("provider_reference"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
	currency: text().notNull(),
	status: text().default('pending').notNull(),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payments_order_idx").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	index("payments_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "payments_order_id_fkey"
		}).onDelete("restrict"),
	unique("payments_provider_provider_reference_key").on(table.provider, table.providerReference),
	pgPolicy("payments_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(app_private.can_manage_commerce() OR (EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = payments.order_id) AND (o.user_id = app_private.current_user_id())))))` }),
	pgPolicy("payments_server_access", { as: "permissive", for: "all", to: ["app_server"] }),
	check("payments_amount_minor_check", sql`amount_minor >= 0`),
	check("payments_check", sql`(status <> 'succeeded'::text) OR (paid_at IS NOT NULL)`),
	check("payments_currency_check", sql`currency ~ '^[A-Z]{3}$'::text`),
	check("payments_status_check", sql`status = ANY (ARRAY['pending'::text, 'processing'::text, 'succeeded'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text])`),
]);

export const paymentEvents = pgTable("payment_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	provider: text().notNull(),
	providerEventId: text("provider_event_id").notNull(),
	eventType: text("event_type").notNull(),
	payload: jsonb().default({}).notNull(),
	processedAt: timestamp("processed_at", { withTimezone: true, mode: 'string' }),
	processingError: text("processing_error"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("payment_events_provider_provider_event_id_key").on(table.provider, table.providerEventId),
	pgPolicy("payment_events_admin_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`app_private.can_manage_commerce()` }),
	pgPolicy("payment_events_server_access", { as: "permissive", for: "all", to: ["app_server"] }),
]);

export const downloadEntitlements = pgTable("download_entitlements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderItemId: uuid("order_item_id").notNull(),
	userId: uuid("user_id"),
	guestEmail: text("guest_email"),
	maxDownloads: integer("max_downloads").default(5).notNull(),
	downloadCount: integer("download_count").default(0).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	grantedAt: timestamp("granted_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	revokedAt: timestamp("revoked_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("download_entitlements_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orderItemId],
			foreignColumns: [orderItems.id],
			name: "download_entitlements_order_item_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "download_entitlements_user_id_fkey"
		}).onDelete("set null"),
	unique("download_entitlements_order_item_id_key").on(table.orderItemId),
	pgPolicy("download_entitlements_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`((user_id = app_private.current_user_id()) OR app_private.can_manage_commerce())` }),
	pgPolicy("download_entitlements_server_access", { as: "permissive", for: "all", to: ["app_server"] }),
	check("download_entitlements_check", sql`(user_id IS NOT NULL) OR (guest_email IS NOT NULL)`),
	check("download_entitlements_check1", sql`download_count <= max_downloads`),
	check("download_entitlements_download_count_check", sql`download_count >= 0`),
	check("download_entitlements_max_downloads_check", sql`max_downloads > 0`),
]);

export const downloadAccessTokens = pgTable("download_access_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	entitlementId: uuid("entitlement_id").notNull(),
	tokenHash: text("token_hash").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	usedAt: timestamp("used_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("download_access_tokens_entitlement_idx").using("btree", table.entitlementId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.entitlementId],
			foreignColumns: [downloadEntitlements.id],
			name: "download_access_tokens_entitlement_id_fkey"
		}).onDelete("cascade"),
	unique("download_access_tokens_token_hash_key").on(table.tokenHash),
	pgPolicy("download_access_tokens_server_access", { as: "permissive", for: "all", to: ["app_server"], using: sql`true`, withCheck: sql`true`  }),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	productPlanId: uuid("product_plan_id").notNull(),
	provider: text().notNull(),
	providerSubscriptionId: text("provider_subscription_id"),
	status: text().default('pending').notNull(),
	currentPeriodStart: timestamp("current_period_start", { withTimezone: true, mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("subscriptions_plan_idx").using("btree", table.productPlanId.asc().nullsLast().op("uuid_ops")),
	index("subscriptions_user_status_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productPlanId],
			foreignColumns: [productPlans.id],
			name: "subscriptions_product_plan_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "subscriptions_user_id_fkey"
		}).onDelete("restrict"),
	unique("subscriptions_provider_subscription_id_key").on(table.providerSubscriptionId),
	pgPolicy("subscriptions_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`((user_id = app_private.current_user_id()) OR app_private.can_manage_commerce())` }),
	pgPolicy("subscriptions_server_access", { as: "permissive", for: "all", to: ["app_server"] }),
	check("subscriptions_check", sql`(current_period_end IS NULL) OR (current_period_start IS NULL) OR (current_period_end > current_period_start)`),
	check("subscriptions_status_check", sql`status = ANY (ARRAY['pending'::text, 'active'::text, 'past_due'::text, 'paused'::text, 'cancelled'::text, 'expired'::text])`),
]);

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id"),
	productTitleSnapshot: text("product_title_snapshot").notNull(),
	quantity: integer().default(1).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	unitPriceMinor: bigint("unit_price_minor", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lineTotalMinor: bigint("line_total_minor", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("order_items_order_idx").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	index("order_items_product_idx").using("btree", table.productId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_product_id_fkey"
		}).onDelete("set null"),
	pgPolicy("order_items_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(app_private.can_manage_commerce() OR (EXISTS ( SELECT 1
   FROM orders o
  WHERE ((o.id = order_items.order_id) AND (o.user_id = app_private.current_user_id())))))` }),
	pgPolicy("order_items_server_access", { as: "permissive", for: "all", to: ["app_server"] }),
	check("order_items_check", sql`line_total_minor = (quantity * unit_price_minor)`),
	check("order_items_line_total_minor_check", sql`line_total_minor >= 0`),
	check("order_items_quantity_check", sql`quantity > 0`),
	check("order_items_unit_price_minor_check", sql`unit_price_minor >= 0`),
]);

export const productFiles = pgTable("product_files", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	version: text().notNull(),
	storageProvider: text("storage_provider").notNull(),
	storageKey: text("storage_key").notNull(),
	fileName: text("file_name").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }),
	checksumSha256: text("checksum_sha256"),
	isActive: boolean("is_active").default(true).notNull(),
	uploadedBy: uuid("uploaded_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("product_files_uploaded_by_idx").using("btree", table.uploadedBy.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_files_product_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [user.id],
			name: "product_files_uploaded_by_fkey"
		}).onDelete("set null"),
	unique("product_files_product_id_version_file_name_key").on(table.fileName, table.productId, table.version),
	pgPolicy("product_files_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_commerce()`, withCheck: sql`app_private.can_manage_commerce()`  }),
	pgPolicy("product_files_server_access", { as: "permissive", for: "all", to: ["app_server"] }),
	check("product_files_file_size_check", sql`(file_size IS NULL) OR (file_size >= 0)`),
	check("product_files_storage_provider_check", sql`storage_provider = ANY (ARRAY['s3_compatible'::text, 'private_storage'::text])`),
]);

export const profiles = pgTable("profiles", {
	userId: uuid("user_id").primaryKey().notNull(),
	username: text().notNull(),
	displayName: text("display_name").notNull(),
	bio: text(),
	avatarMediaId: uuid("avatar_media_id"),
	websiteUrl: text("website_url"),
	location: text(),
	isPublic: boolean("is_public").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("profiles_avatar_media_idx").using("btree", table.avatarMediaId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("profiles_username_lower_idx").using("btree", sql`lower(username)`),
	foreignKey({
			columns: [table.avatarMediaId],
			foreignColumns: [mediaAssets.id],
			name: "profiles_avatar_media_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "profiles_user_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("profiles_authenticated_read", { as: "permissive", for: "select", to: ["authenticated"], using: sql`((user_id = app_private.current_user_id()) OR app_private.is_admin())` }),
	pgPolicy("profiles_insert_own", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("profiles_update_own", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("profiles_admin_manage", { as: "permissive", for: "all", to: ["authenticated"] }),
	pgPolicy("profiles_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("profiles_bio_check", sql`(bio IS NULL) OR (length(bio) <= 2000)`),
	check("profiles_display_name_check", sql`(length(display_name) >= 1) AND (length(display_name) <= 100)`),
	check("profiles_location_check", sql`(location IS NULL) OR (length(location) <= 200)`),
	check("profiles_username_check", sql`username ~ '^[A-Za-z0-9_]{3,30}$'::text`),
	check("profiles_website_url_check", sql`(website_url IS NULL) OR ((website_url ~* '^https?://'::text) AND (length(website_url) <= 2048))`),
]);

export const socialLinks = pgTable("social_links", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	platform: text().notNull(),
	label: text(),
	url: text().notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	pgPolicy("social_links_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("social_links_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
]);

export const mediaAssets = pgTable("media_assets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	provider: text().notNull(),
	providerAssetId: text("provider_asset_id"),
	publicId: text("public_id").notNull(),
	secureUrl: text("secure_url").notNull(),
	resourceType: text("resource_type").notNull(),
	format: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	bytes: bigint({ mode: "number" }),
	width: integer(),
	height: integer(),
	altText: text("alt_text"),
	caption: text(),
	visibility: text().default('public').notNull(),
	status: text().default('ready').notNull(),
	uploadedBy: uuid("uploaded_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("media_assets_uploaded_by_idx").using("btree", table.uploadedBy.asc().nullsLast().op("uuid_ops")),
	index("media_assets_visibility_status_idx").using("btree", table.visibility.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [user.id],
			name: "media_assets_uploaded_by_fkey"
		}).onDelete("set null"),
	unique("media_assets_public_id_key").on(table.publicId),
	pgPolicy("media_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`(app_private.can_manage_content() AND (app_private.can_manage_inquiries() OR (NOT app_private.is_inquiry_attachment(id))))`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("media_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	pgPolicy("media_inquiry_attachment_read", { as: "permissive", for: "select", to: ["authenticated"] }),
	check("media_assets_bytes_check", sql`(bytes IS NULL) OR (bytes >= 0)`),
	check("media_assets_height_check", sql`(height IS NULL) OR (height > 0)`),
	check("media_assets_resource_type_check", sql`resource_type = ANY (ARRAY['image'::text, 'video'::text, 'raw'::text])`),
	check("media_assets_status_check", sql`status = ANY (ARRAY['uploading'::text, 'ready'::text, 'failed'::text, 'deleted'::text])`),
	check("media_assets_visibility_check", sql`visibility = ANY (ARRAY['public'::text, 'private'::text])`),
	check("media_assets_width_check", sql`(width IS NULL) OR (width > 0)`),
]);

export const technologies = pgTable("technologies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	icon: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("technologies_name_key").on(table.name),
	unique("technologies_slug_key").on(table.slug),
	pgPolicy("technologies_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("technologies_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
]);

export const projectMedia = pgTable("project_media", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	mediaAssetId: uuid("media_asset_id").notNull(),
	role: text().default('gallery').notNull(),
	altText: text("alt_text"),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("project_media_media_idx").using("btree", table.mediaAssetId.asc().nullsLast().op("uuid_ops")),
	index("project_media_project_idx").using("btree", table.projectId.asc().nullsLast().op("int4_ops"), table.sortOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.mediaAssetId],
			foreignColumns: [mediaAssets.id],
			name: "project_media_media_asset_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_media_project_id_fkey"
		}).onDelete("cascade"),
	unique("project_media_project_id_media_asset_id_key").on(table.mediaAssetId, table.projectId),
	pgPolicy("project_media_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("project_media_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("project_media_role_check", sql`role = ANY (ARRAY['cover'::text, 'gallery'::text, 'video'::text])`),
]);

export const projectUpdates = pgTable("project_updates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id").notNull(),
	title: text().notNull(),
	content: text().notNull(),
	visibility: text().default('draft').notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("project_updates_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("project_updates_project_date_idx").using("btree", table.projectId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "project_updates_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_updates_project_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("project_updates_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("project_updates_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("project_updates_visibility_check", sql`visibility = ANY (ARRAY['draft'::text, 'public'::text])`),
]);

export const posts = pgTable("posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	authorId: uuid("author_id").notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	excerpt: text(),
	contentJson: jsonb("content_json").default({}).notNull(),
	searchText: text("search_text").default('').notNull(),
	contentType: text("content_type").notNull(),
	status: text().default('draft').notNull(),
	seoTitle: text("seo_title"),
	seoDescription: text("seo_description"),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: 'string' }),
	allowComments: boolean("allow_comments").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("posts_author_idx").using("btree", table.authorId.asc().nullsLast().op("uuid_ops")),
	index("posts_search_idx").using("gin", sql`to_tsvector('english'::regconfig, ((((COALESCE(title, ''::text)`),
	index("posts_status_type_date_idx").using("btree", table.status.asc().nullsLast().op("text_ops"), table.contentType.asc().nullsLast().op("text_ops"), table.publishedAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [user.id],
			name: "posts_author_id_fkey"
		}).onDelete("restrict"),
	unique("posts_slug_key").on(table.slug),
	pgPolicy("posts_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("posts_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("posts_check", sql`(status <> 'scheduled'::text) OR (scheduled_at IS NOT NULL)`),
	check("posts_check1", sql`(status <> 'published'::text) OR (published_at IS NOT NULL)`),
	check("posts_content_json_check", sql`jsonb_typeof(content_json) = 'object'::text`),
	check("posts_content_type_check", sql`content_type = ANY (ARRAY['article'::text, 'tutorial'::text, 'development_log'::text, 'project_update'::text, 'announcement'::text, 'personal_thought'::text])`),
	check("posts_slug_check", sql`slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text`),
	check("posts_status_check", sql`status = ANY (ARRAY['draft'::text, 'scheduled'::text, 'published'::text, 'archived'::text])`),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("categories_name_key").on(table.name),
	unique("categories_slug_key").on(table.slug),
	pgPolicy("categories_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("categories_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
]);

export const tags = pgTable("tags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("tags_name_key").on(table.name),
	unique("tags_slug_key").on(table.slug),
	pgPolicy("tags_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("tags_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
]);

export const postMedia = pgTable("post_media", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	mediaAssetId: uuid("media_asset_id").notNull(),
	role: text().default('inline').notNull(),
	altText: text("alt_text"),
	caption: text(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("post_media_media_idx").using("btree", table.mediaAssetId.asc().nullsLast().op("uuid_ops")),
	index("post_media_post_idx").using("btree", table.postId.asc().nullsLast().op("int4_ops"), table.sortOrder.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.mediaAssetId],
			foreignColumns: [mediaAssets.id],
			name: "post_media_media_asset_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_media_post_id_fkey"
		}).onDelete("cascade"),
	unique("post_media_post_id_media_asset_id_key").on(table.mediaAssetId, table.postId),
	pgPolicy("post_media_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("post_media_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("post_media_role_check", sql`role = ANY (ARRAY['cover'::text, 'inline'::text, 'attachment'::text])`),
]);

export const postComments = pgTable("post_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	postId: uuid("post_id").notNull(),
	userId: uuid("user_id").notNull(),
	parentCommentId: uuid("parent_comment_id"),
	body: text().notNull(),
	status: text().default('pending').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("post_comments_parent_idx").using("btree", table.parentCommentId.asc().nullsLast().op("uuid_ops")),
	index("post_comments_post_status_idx").using("btree", table.postId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("uuid_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("post_comments_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.postId, table.parentCommentId],
			foreignColumns: [table.id, table.postId],
			name: "post_comments_parent_comment_id_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_comments_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "post_comments_user_id_fkey"
		}).onDelete("cascade"),
	unique("post_comments_id_post_id_key").on(table.id, table.postId),
	pgPolicy("post_comments_user_read_own", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(user_id = app_private.current_user_id())` }),
	pgPolicy("post_comments_user_insert", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("post_comments_user_update_own_pending", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("post_comments_admin_manage", { as: "permissive", for: "all", to: ["authenticated"] }),
	pgPolicy("post_comments_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("post_comments_body_check", sql`(length(btrim(body)) >= 1) AND (length(btrim(body)) <= 5000)`),
	check("post_comments_status_check", sql`status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'spam'::text])`),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	projectId: uuid("project_id"),
	title: text().notNull(),
	slug: text().notNull(),
	description: text(),
	productType: text("product_type").notNull(),
	pricingModel: text("pricing_model").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	priceAmountMinor: bigint("price_amount_minor", { mode: "number" }),
	currency: text().default('GHS').notNull(),
	status: text().default('draft').notNull(),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("products_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("products_status_type_idx").using("btree", table.status.asc().nullsLast().op("text_ops"), table.productType.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "products_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "products_project_id_fkey"
		}).onDelete("set null"),
	unique("products_project_id_key").on(table.projectId),
	unique("products_slug_key").on(table.slug),
	pgPolicy("products_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_commerce()`, withCheck: sql`app_private.can_manage_commerce()`  }),
	pgPolicy("products_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("products_check", sql`(status <> 'published'::text) OR (published_at IS NOT NULL)`),
	check("products_check1", sql`(pricing_model <> 'one_time'::text) OR (price_amount_minor IS NOT NULL)`),
	check("products_check2", sql`(pricing_model <> 'quote'::text) OR (price_amount_minor IS NULL)`),
	check("products_check3", sql`(product_type <> 'hosted_software'::text) OR (pricing_model = 'subscription'::text)`),
	check("products_currency_check", sql`currency ~ '^[A-Z]{3}$'::text`),
	check("products_price_amount_minor_check", sql`(price_amount_minor IS NULL) OR (price_amount_minor >= 0)`),
	check("products_pricing_model_check", sql`pricing_model = ANY (ARRAY['one_time'::text, 'subscription'::text, 'quote'::text, 'free'::text])`),
	check("products_product_type_check", sql`product_type = ANY (ARRAY['source_code'::text, 'hosted_software'::text, 'service'::text])`),
	check("products_status_check", sql`status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])`),
]);

export const productMedia = pgTable("product_media", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	mediaAssetId: uuid("media_asset_id").notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("product_media_media_idx").using("btree", table.mediaAssetId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.mediaAssetId],
			foreignColumns: [mediaAssets.id],
			name: "product_media_media_asset_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_media_product_id_fkey"
		}).onDelete("cascade"),
	unique("product_media_product_id_media_asset_id_key").on(table.mediaAssetId, table.productId),
	pgPolicy("product_media_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_commerce()`, withCheck: sql`app_private.can_manage_commerce()`  }),
	pgPolicy("product_media_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
]);

export const productPlans = pgTable("product_plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	name: text().notNull(),
	description: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	priceAmountMinor: bigint("price_amount_minor", { mode: "number" }).notNull(),
	currency: text().default('GHS').notNull(),
	billingInterval: text("billing_interval").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_plans_product_id_fkey"
		}).onDelete("cascade"),
	unique("product_plans_product_id_name_key").on(table.name, table.productId),
	pgPolicy("product_plans_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_commerce()`, withCheck: sql`app_private.can_manage_commerce()`  }),
	pgPolicy("product_plans_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("product_plans_billing_interval_check", sql`billing_interval = ANY (ARRAY['month'::text, 'year'::text])`),
	check("product_plans_currency_check", sql`currency ~ '^[A-Z]{3}$'::text`),
	check("product_plans_price_amount_minor_check", sql`price_amount_minor >= 0`),
]);

export const siteSettings = pgTable("site_settings", {
	settingKey: text("setting_key").primaryKey().notNull(),
	settingValue: jsonb("setting_value").default({}).notNull(),
	isPublic: boolean("is_public").default(false).notNull(),
	updatedBy: uuid("updated_by"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("site_settings_updated_by_idx").using("btree", table.updatedBy.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [user.id],
			name: "site_settings_updated_by_fkey"
		}).onDelete("set null"),
	pgPolicy("site_settings_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.is_admin()`, withCheck: sql`app_private.is_admin()`  }),
	pgPolicy("site_settings_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
]);

export const projectTechnologies = pgTable("project_technologies", {
	projectId: uuid("project_id").notNull(),
	technologyId: uuid("technology_id").notNull(),
}, (table) => [
	index("project_technologies_technology_idx").using("btree", table.technologyId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "project_technologies_project_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.technologyId],
			foreignColumns: [technologies.id],
			name: "project_technologies_technology_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.projectId, table.technologyId], name: "project_technologies_pkey"}),
	pgPolicy("project_technologies_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("project_technologies_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
]);

export const postCategories = pgTable("post_categories", {
	postId: uuid("post_id").notNull(),
	categoryId: uuid("category_id").notNull(),
}, (table) => [
	index("post_categories_category_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "post_categories_category_id_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_categories_post_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.categoryId, table.postId], name: "post_categories_pkey"}),
	pgPolicy("post_categories_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("post_categories_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
]);

export const postTags = pgTable("post_tags", {
	postId: uuid("post_id").notNull(),
	tagId: uuid("tag_id").notNull(),
}, (table) => [
	index("post_tags_tag_idx").using("btree", table.tagId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_tags_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: "post_tags_tag_id_fkey"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.postId, table.tagId], name: "post_tags_pkey"}),
	pgPolicy("post_tags_admin_manage", { as: "permissive", for: "all", to: ["authenticated"], using: sql`app_private.can_manage_content()`, withCheck: sql`app_private.can_manage_content()`  }),
	pgPolicy("post_tags_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
]);

export const follows = pgTable("follows", {
	followerId: uuid("follower_id").notNull(),
	followedId: uuid("followed_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("follows_followed_id_idx").using("btree", table.followedId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.followedId],
			foreignColumns: [user.id],
			name: "follows_followed_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.followerId],
			foreignColumns: [user.id],
			name: "follows_follower_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.followedId, table.followerId], name: "follows_pkey"}),
	pgPolicy("follows_read_own", { as: "permissive", for: "select", to: ["authenticated"], using: sql`(follower_id = app_private.current_user_id())` }),
	pgPolicy("follows_insert_own", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("follows_delete_own", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("follows_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("follows_check", sql`follower_id <> followed_id`),
]);

export const postReactions = pgTable("post_reactions", {
	postId: uuid("post_id").notNull(),
	userId: uuid("user_id").notNull(),
	reaction: text().default('like').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("post_reactions_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_reactions_post_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "post_reactions_user_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.postId, table.reaction, table.userId], name: "post_reactions_pkey"}),
	pgPolicy("post_reactions_user_insert", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`((user_id = app_private.current_user_id()) AND (EXISTS ( SELECT 1
   FROM posts p
  WHERE ((p.id = post_reactions.post_id) AND (p.status = 'published'::text) AND (p.published_at <= now())))))`  }),
	pgPolicy("post_reactions_user_delete", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("post_reactions_public_read", { as: "permissive", for: "select", to: ["anonymous", "app_server", "authenticated"] }),
	check("post_reactions_reaction_check", sql`reaction = ANY (ARRAY['like'::text, 'love'::text, 'useful'::text])`),
]);
