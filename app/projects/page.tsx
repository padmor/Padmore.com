import { ProjectExplorer } from "@/features/projects/components/project-explorer";
import { PageIntro } from "@/components/page-intro";
export const metadata = { title: "Projects" };
export default function ProjectsPage() { return <section className="page-container content-page"><PageIntro eyebrow="SELECTED WORK & EXPERIMENTS" title="My Projects" description="A collection of projects built with modern technologies, solving real-world problems and exploring new ideas."/><ProjectExplorer/></section>; }
