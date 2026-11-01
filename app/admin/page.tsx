import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Icon } from "@/components/icon";
import { AdminPreviewNotice } from "@/features/admin/components/admin-preview-notice";
import { MetricCard } from "@/features/analytics/components/metric-card";
import { requireRole } from "@/lib/auth/session";

export const metadata = { title: "Admin dashboard" };
export const dynamic = "force-dynamic";

const adminLinks = [
  { label: "Dashboard", icon: "home", href: "/admin" },
  { label: "Projects", icon: "grid", href: "/projects" },
  { label: "Tutorials", icon: "book", href: "/tutorials" },
  { label: "Products", icon: "store", href: "/store" },
  { label: "Users", icon: "users", href: "/community" },
  { label: "Requests", icon: "briefcase", href: "/request-project" },
  { label: "Collaborations", icon: "layers", href: "/build-with-me" },
  { label: "Settings", icon: "settings", href: "/contact" },
] as const;

export default async function AdminPage() {
  await requireRole(["owner", "admin", "editor", "support"]);
  return (
    <section className="page-container content-page admin-page">
      <PageIntro eyebrow="PRIVATE MANAGEMENT AREA" title="Dashboard" description="A preview of the tools for managing your portfolio content and activity." />
      <AdminPreviewNotice/>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand"><span className="brand-mark">P</span><strong>Portfolio Admin</strong></div>
          {adminLinks.map((item) => (
            <Link key={item.label} href={item.href} className={item.label === "Dashboard" ? "active" : ""}>
              <Icon name={item.icon} />{item.label}
            </Link>
          ))}
        </aside>
        <div className="admin-content">
          <div className="admin-title-row">
            <div><h2>Overview</h2><p>Activity and content summary</p></div>
            <span className="date-label">Preview data</span>
          </div>
          <div className="admin-stats">
            <MetricCard label="Total users" value="—" note="Connect authentication"/>
            <MetricCard label="Total projects" value="6" note="Illustrative entries"/>
            <MetricCard label="Total sales" value="—" note="Payments not connected"/>
            <MetricCard label="Active enquiries" value="—" note="Backend not connected"/>
          </div>
          <div className="admin-panels">
            <section className="admin-panel">
              <div className="row-between"><h3>Portfolio activity</h3><span className="eyebrow">SAMPLE</span></div>
              <div className="chart-placeholder">
                <div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
                <svg viewBox="0 0 600 190" role="img" aria-label="Illustrative analytics trend">
                  <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4169f5" stopOpacity=".2"/><stop offset="1" stopColor="#4169f5" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0 155 C55 130 70 145 110 110 S185 125 225 82 S280 105 325 74 S390 105 430 52 S500 80 540 30 S580 45 600 20 L600 190 L0 190Z" fill="url(#chartFill)" />
                  <path d="M0 155 C55 130 70 145 110 110 S185 125 225 82 S280 105 325 74 S390 105 430 52 S500 80 540 30 S580 45 600 20" fill="none" stroke="#4169f5" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div className="chart-legend"><span>Illustrative trend only</span><span>Replace with real analytics</span></div>
            </section>
            <section className="admin-panel">
              <h3>Quick actions</h3>
              <div className="quick-action-list">
                <Link href="/projects"><Icon name="plus" /> Review projects</Link>
                <Link href="/tutorials"><Icon name="book" /> Manage tutorials</Link>
                <Link href="/store"><Icon name="store" /> Review products</Link>
                <Link href="/request-project"><Icon name="briefcase" /> View project request flow</Link>
              </div>
            </section>
          </div>
          <section className="admin-panel admin-recent">
            <h3>Recent activity</h3>
            <div className="activity-row"><span className="activity-dot blue" /><div><strong>Portfolio foundation created</strong><small>Development preview</small></div><time>Today</time></div>
            <div className="activity-row"><span className="activity-dot violet" /><div><strong>Responsive design system outlined</strong><small>Planning note</small></div><time>Today</time></div>
            <div className="activity-row"><span className="activity-dot cyan" /><div><strong>Module structure established</strong><small>Architecture note</small></div><time>Today</time></div>
          </section>
        </div>
      </div>
    </section>
  );
}
