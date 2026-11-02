import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Icon } from "@/components/icon";
import { ArticleBody } from "@/features/content/components/article-body";
import { Portrait } from "@/features/content/components/site-image";
import { getAbout } from "@/modules/content/repository";
export const metadata = { title: "About Me" };
export const revalidate = 300;
export default async function AboutPage() { const about = await getAbout(); return <section className="page-container content-page"><PageIntro eyebrow="THE PERSON BEHIND THE PROJECTS" title="About me" description={about.intro}/><div className="about-layout"><div className="about-photo"><Portrait photoId={about.photo_id} sizes="(max-width: 700px) 90vw, 420px"/></div><div className="about-copy"><span className="eyebrow">DEVELOPER · CREATOR · PROBLEM SOLVER</span><h2>{about.headline}</h2><ArticleBody text={about.bio}/><div className="about-actions"><Link href="/projects" className="button button-primary">Explore my work <Icon name="arrow" size={16}/></Link><Link href="/contact" className="button button-outline">Get in touch</Link></div></div></div>{about.skills.length > 0 && <section className="section-block"><h2>Technologies I'm learning and using</h2><div className="skill-cloud">{about.skills.map((skill) => <span className="skill-pill" key={skill}>{skill}</span>)}</div></section>}<section className="section-block values-strip"><div><Icon name="code"/><h3>Build thoughtfully</h3><p>Prioritize clear structure and maintainable code.</p></div><div><Icon name="book"/><h3>Keep learning</h3><p>Share practical lessons from the process.</p></div><div><Icon name="users"/><h3>Grow together</h3><p>Connect with people who enjoy solving problems.</p></div></section></section>; }
