import { ProjectExplorer } from "@/features/projects/components/project-explorer";
import { PageIntro } from "@/components/page-intro";
import { listPublicProjects } from "@/modules/portfolio/repository";
export const metadata = { title: "Projects" };
export const revalidate = 300;
export default async function ProjectsPage() { const projects = await listPublicProjects(); return <section className="page-container content-page"><PageIntro title="Projects" description="A portfolio of completed and in-progress work."/><ProjectExplorer projects={projects}/></section>; }
