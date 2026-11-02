import { PageIntro } from "@/components/page-intro";
import { HostedAppGrid } from "@/features/hosted-apps/components/hosted-app-grid";
export const metadata = { title: "Hosted Applications" };
export const revalidate = 300;

export default function HostedAppsPage() {
  return <section className="page-container content-page">
    <PageIntro eyebrow="LIVE PRODUCTS & DEMOS" title="Hosted applications" description="Explore applications and product experiences that are available as live demos or hosted software."/>
    <HostedAppGrid/>
  </section>;
}
