import Image from "next/image";
import Link from "next/link";
import { projects, tutorials } from "@/lib/data";
import { ProjectCard } from "@/features/projects/components/project-card";
import { TutorialCard } from "@/features/tutorials/components/tutorial-card";
import { SectionHeading } from "@/components/page-intro";
import { Icon } from "@/components/icon";
import { NewsletterForm } from "@/features/contact/components/newsletter-form";

const values = [
  { icon: "code" as const, title: "Clean code", text: "Readable, maintainable foundations that are easier to grow." },
  { icon: "clock" as const, title: "Thoughtful delivery", text: "Plan carefully, communicate clearly and keep work moving." },
  { icon: "message" as const, title: "Clear communication", text: "Share context, decisions and progress throughout a project." },
  { icon: "heart" as const, title: "People first", text: "Keep real user needs at the centre of the solution." },
];

export default function HomePage() {
  return <>
    <section className="hero page-container">
      <div className="hero-copy">
        <span className="hero-kicker"><span className="pulse-dot"/> Build · Learn · Collaborate · Grow</span>
        <h1>Hi, I&apos;m Padmore Yeb <span className="wave">👋</span><br/>I build modern web &amp; mobile applications that solve <em>real problems.</em></h1>
        <p className="hero-description">Developer <span>·</span> Creator <span>·</span> Problem solver</p>
        <div className="hero-actions"><Link href="/projects" className="button button-primary">View my projects <Icon name="arrow" size={16}/></Link><Link href="/contact" className="button button-outline"><Icon name="mail" size={16}/> Contact me</Link></div>
        <div className="hero-proof"><span><Icon name="check-circle" size={15}/> Open to collaboration</span><span><Icon name="globe" size={15}/> Building for the web</span></div>
      </div>
      <div className="hero-visual">
        <div className="hero-orbit hero-orbit-one"/><div className="hero-orbit hero-orbit-two"/><div className="hero-gradient-shape"/>
        <div className="hero-photo-frame"><Image src="/images/portrait-reference-placeholder.webp" alt="Temporary portrait from the supplied design reference; replace with Padmore's own photo" fill priority sizes="(max-width: 700px) 70vw, 420px" className="hero-photo"/></div>
        <div className="hero-float-card availability-card"><span className="availability-check"><Icon name="check" size={13}/></span><span><strong>Build something meaningful</strong><small>Ideas · Projects · Collaboration</small></span></div>
        <div className="hero-float-card code-card"><span className="code-card-mark">&lt;/&gt;</span><span><strong>Always learning</strong><small>From idea to implementation</small></span></div>
        <span className="hero-mini-tag">Full-stack thinking</span>
      </div>
    </section>

    <section className="page-container quick-stats" aria-label="Portfolio highlights">
      {[{icon:"folder" as const,title:"Projects",copy:"Ideas brought to life"},{icon:"book" as const,title:"Tutorials",copy:"Knowledge shared"},{icon:"users" as const,title:"Community",copy:"People building together"},{icon:"sparkles" as const,title:"New ideas",copy:"Always exploring"}].map((item) => <div className="stat-card" key={item.title}><span className="stat-icon"><Icon name={item.icon}/></span><span><strong>{item.title}</strong><small>{item.copy}</small></span></div>)}
    </section>

    <section className="page-container section-block"><SectionHeading title="Featured projects" description="A selection of software concepts and work in progress." href="/projects"/><div className="project-grid home-project-grid">{projects.filter((project) => project.featured).map((project) => <ProjectCard key={project.slug} project={project}/>)}</div></section>

    <section className="page-container section-block why-section"><SectionHeading title="Why work with me?" description="A thoughtful approach to building useful digital products."/><div className="value-grid">{values.map((item) => <article className="value-card" key={item.title}><span className="value-icon"><Icon name={item.icon}/></span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>

    <section className="page-container section-block two-feature-section"><div className="feature-panel feature-panel-blue"><span className="eyebrow">BUILD WITH ME</span><h2>Good ideas grow faster together.</h2><p>Meet other builders, explore collaboration opportunities and contribute to projects that solve real problems.</p><Link href="/build-with-me" className="button button-primary">Explore opportunities <Icon name="arrow" size={16}/></Link><div className="feature-art feature-art-team"><span>✳</span><span>⌘</span><span>↗</span></div></div><div className="feature-panel feature-panel-violet"><span className="eyebrow">HAVE AN IDEA?</span><h2>Tell me what you need built.</h2><p>Share the problem, your idea or a project brief. We can work through the best way to bring it to life.</p><Link href="/request-project" className="button button-dark">Request a project <Icon name="arrow" size={16}/></Link><div className="feature-art feature-art-project"><span>✦</span><span>▧</span></div></div></section>

    <section className="page-container section-block"><SectionHeading title="Latest tutorials" description="Notes and practical guides from the things I'm learning." href="/tutorials"/><div className="tutorial-grid home-tutorial-grid">{tutorials.slice(0, 3).map((tutorial) => <TutorialCard key={tutorial.slug} tutorial={tutorial}/>)}</div></section>

    <section className="page-container section-block newsletter-panel"><div><span className="eyebrow">STAY IN THE LOOP</span><h2>Follow the journey.</h2><p>Occasional notes about new projects, technical lessons and releases.</p></div><NewsletterForm/></section>
  </>;
}
