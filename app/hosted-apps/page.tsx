import { PageIntro } from "@/components/page-intro";
import { HostedAppGrid } from "@/features/hosted-apps/components/hosted-app-grid";
export const metadata = { title: "Live Projects" };
export const revalidate = 300;

export default function HostedAppsPage() {
  return <section className="page-container content-page">
    <PageIntro title="Live projects" description="Projects you can open and use today."/>
    <HostedAppGrid/>
  </section>;
}
