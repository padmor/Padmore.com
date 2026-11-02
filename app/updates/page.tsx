import { PageIntro } from "@/components/page-intro";
import { UpdateFeed } from "@/features/updates/components/update-feed";
export const metadata = { title: "Updates" };
export const revalidate = 300;

export default function UpdatesPage() {
  return <section className="page-container content-page">
    <PageIntro eyebrow="BUILD IN PUBLIC" title="Latest updates" description="Notes from the work: ideas, progress, lessons and releases."/>
    <UpdateFeed/>
  </section>;
}
