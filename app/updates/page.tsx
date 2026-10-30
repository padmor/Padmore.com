import { PageIntro } from "@/components/page-intro";
import { Icon } from "@/components/icon";
import { UpdateFeed } from "@/features/updates/components/update-feed";
export const metadata = { title: "Updates" };

export default function UpdatesPage() {
  return <section className="page-container content-page">
    <PageIntro eyebrow="BUILD IN PUBLIC" title="Latest updates" description="Notes from the work: ideas, progress, lessons and releases."/>
    <UpdateFeed/>
    <div className="notice-box"><Icon name="info"/><p>These are example updates for the initial build. Replace them with your actual development posts.</p></div>
  </section>;
}
