import { AboutForm } from "@/features/admin/components/about-form";
import { requireRole } from "@/lib/auth/session";
import { getAboutForEditing } from "@/modules/admin/content-repository";
import { DEFAULT_ABOUT } from "@/modules/content/defaults";

export const metadata = { title: "About me" };
export const dynamic = "force-dynamic";

export default async function AdminAboutPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireRole(["owner", "admin"]);
  const [about, { saved }] = await Promise.all([getAboutForEditing(), searchParams]);
  return <>
    <div className="admin-title-row"><div><span className="eyebrow">CONTENT</span><h1>About me</h1><p>Your biography and skills on the About and Profile pages.</p></div></div>
    <AboutForm about={about ?? DEFAULT_ABOUT} saved={saved === "1"}/>
  </>;
}
