import { PageIntro } from "@/components/page-intro";
import { UpdateFeed } from "@/features/updates/components/update-feed";
export const metadata = { title: "Updates" };
export const revalidate = 300;

export default function UpdatesPage() {
  return <section className="page-container content-page">
    <PageIntro title="Updates" description="Recent news and progress on current work."/>
    <UpdateFeed/>
  </section>;
}
