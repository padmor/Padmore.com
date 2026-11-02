import { listPublicProjects } from "@/modules/portfolio/repository";
import { getAbout } from "@/modules/content/repository";
import { PageIntro } from "@/components/page-intro";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProfileHeading } from "@/features/profile/components/profile-heading";
export const metadata = { title: "Profile" };
export const revalidate = 300;
export default async function ProfilePage() { const [projects, about] = await Promise.all([listPublicProjects(), getAbout()]); return <section className="page-container content-page"><PageIntro eyebrow="PERSONAL PROFILE" title="Padmore Yeb" description="Developer · Creator · Problem solver"/><div className="profile-panel"><ProfileHeading headline={about.headline} location={about.location} photoId={about.photo_id}/><div className="profile-stats"><div><strong>{projects.length}</strong><span>Projects</span></div></div><div className="profile-bio"><h3>About me</h3><p>{about.intro}</p>{about.skills.length > 0 && <div className="skill-cloud">{about.skills.map((skill) => <span className="skill-pill" key={skill}>{skill}</span>)}</div>}</div></div><section className="section-block"><h2>Selected projects</h2><div className="project-grid">{projects.slice(0, 3).map((project) => <ProjectCard project={project} key={project.slug}/>)}</div></section></section>; }
