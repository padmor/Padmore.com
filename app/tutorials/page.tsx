import { PageIntro } from "@/components/page-intro";
import { TutorialExplorer } from "@/features/tutorials/components/tutorial-explorer";
export const metadata = { title: "Tutorials" };
export default function TutorialsPage() { return <section className="page-container content-page"><PageIntro eyebrow="LEARN & SHARE" title="Tutorials" description="Learn new skills with step-by-step guides, tutorials and resources from my learning journey."/><TutorialExplorer/></section>; }
