import Link from "next/link";
import { Icon } from "@/components/icon";
import { MetricCard } from "@/features/analytics/components/metric-card";
import { requireRole } from "@/lib/auth/session";
import { getDashboardStats, listRecentActivity } from "@/modules/admin/repository";

export const metadata = { title: "Manager portal" };
export const dynamic = "force-dynamic";

const actionLabel = (action: string) => {
  const text = action.replaceAll(".", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const show = (value: number | null) => (value === null ? "—" : String(value));
const access = (value: number | null, note: string) => (value === null ? "Not available for your role" : note);

export default async function AdminPage() {
  const { roles } = await requireRole(["owner", "admin", "editor", "support"]);
  const canEdit = roles.some((role) => role !== "support");
  const [stats, activity] = await Promise.all([getDashboardStats(), listRecentActivity()]);
  return <>
    <div className="admin-title-row">
      <div><span className="eyebrow">LIVE FROM THE DATABASE</span><h1>Dashboard</h1><p>What's on the site and what needs your attention.</p></div>
      {canEdit && <Link className="button button-primary button-small" href="/admin/projects/new"><Icon name="plus" size={15}/> Add project</Link>}
    </div>
    <div className="admin-stats">
      <MetricCard label="Total projects" value={show(stats.projects)} note={access(stats.projects, "Every status and visibility")}/>
      <MetricCard label="Live on the site" value={show(stats.live)} note={access(stats.live, "Public and not archived")}/>
      <MetricCard label="Drafts" value={show(stats.drafts)} note={access(stats.drafts, "Not visible to the public")}/>
      <MetricCard label="In progress" value={show(stats.inProgress)} note={access(stats.inProgress, "Currently being built")}/>
      <MetricCard label="Featured" value={show(stats.featured)} note={access(stats.featured, "Shown on the home page")}/>
      <MetricCard label="Published tutorials" value={show(stats.tutorials)} note={access(stats.tutorials, "On the Tutorials page")}/>
      <MetricCard label="Published products" value={show(stats.products)} note={access(stats.products, "On the Store page")}/>
      <MetricCard label="Open enquiries" value={show(stats.openInquiries)} note={access(stats.openInquiries, "Awaiting a response")}/>
      <MetricCard label="Paid orders" value={show(stats.paidOrders)} note={access(stats.paidOrders, "Payments not connected yet")}/>
      <MetricCard label="Subscribers" value={show(stats.subscribers)} note={access(stats.subscribers, "Newsletter sign-ups")}/>
    </div>
    <section className="admin-panel admin-recent">
      <h3>Recent activity</h3>
      {activity.length ? activity.map((item) => <div className="activity-row" key={item.id}><span className="activity-dot blue"/><div><strong>{actionLabel(item.action)}</strong><small>{item.metadata?.title ?? ""}</small></div><time>{new Date(item.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</time></div>) : <p className="muted-copy">Changes will appear here. Activity is visible to owners and admins.</p>}
    </section>
  </>;
}
