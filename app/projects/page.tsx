import { ProjectExplorer } from "@/features/projects/components/project-explorer";
import { PageIntro } from "@/components/page-intro";
import { listPublicProjects } from "@/modules/portfolio/repository";
export const metadata = { title: "Projects" };
export const revalidate = 300;
export default async function ProjectsPage() { const projects = await listPublicProjects(); return <section className="page-container content-page"><PageIntro eyebrow="SELECTED WORK & EXPERIMENTS" title="My Projects" description="A collection of projects built with modern technologies, solving real-world problems and exploring new ideas."/><ProjectExplorer projects={projects}/></section>; }
