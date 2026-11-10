import Link from "next/link";
import { Icon } from "@/components/icon";
import { requireRole } from "@/lib/auth/session";
import { COLLECTIONS } from "@/modules/admin/collections";
import { BrandMark } from "@/components/brand-mark";

// Layouts don't re-run on every navigation, so each page also checks the role.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { roles } = await requireRole(["owner", "admin", "editor", "support"]);
  const canEdit = roles.some((role) => role !== "support");
  const sections = Object.entries(COLLECTIONS).filter(([, section]) => roles.some((role) => (section.roles as readonly string[]).includes(role)));
  const canEditAbout = roles.includes("owner") || roles.includes("admin");
  return <section className="page-container content-page admin-page">
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand"><BrandMark/><strong>Manager portal</strong></div>
        <Link href="/admin"><Icon name="home"/>Dashboard</Link>
        {canEdit && <Link href="/admin/projects"><Icon name="grid"/>Projects</Link>}
        {sections.map(([key, section]) => <Link key={key} href={`/admin/${key}`}><Icon name={section.icon}/>{section.label}</Link>)}
        {canEditAbout && <Link href="/admin/about"><Icon name="user"/>About me</Link>}
        {canEdit && <Link href="/admin/images"><Icon name="layers"/>Attached images</Link>}
        {(canEditAbout || roles.includes("support")) && <Link href="/admin/enquiries"><Icon name="mail"/>Enquiries</Link>}
        {canEditAbout && <Link href="/admin/subscribers"><Icon name="bell"/>Subscribers</Link>}
        {canEditAbout && <Link href="/admin/engagement"><Icon name="chart"/>Engagement</Link>}
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  </section>;
}
