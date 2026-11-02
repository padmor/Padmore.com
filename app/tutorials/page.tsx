import { PageIntro } from "@/components/page-intro";
import { TutorialExplorer } from "@/features/tutorials/components/tutorial-explorer";
import { listPublicTutorials } from "@/modules/content/repository";
export const metadata = { title: "Tutorials" };
export const revalidate = 300;
export default async function TutorialsPage() { const tutorials = await listPublicTutorials(); return <section className="page-container content-page"><PageIntro eyebrow="LEARN & SHARE" title="Tutorials" description="Learn new skills with step-by-step guides, tutorials and resources from my learning journey."/><TutorialExplorer tutorials={tutorials}/></section>; }
