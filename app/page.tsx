import Link from "next/link";
import { HeroSlideshow } from "@/features/home/components/hero-slideshow";
import { HeroIntro } from "@/features/home/components/hero-intro";
import { FollowButton } from "@/features/follow/components/follow-button";
import { BiographyProfile } from "@/features/home/components/biography-profile";
import { HeroStats } from "@/features/home/components/hero-stats";
import { ArrowRight, FolderKanban, GraduationCap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAbout, listPublicTutorials, listSocialLinks } from "@/modules/content/repository";
import { listPublicAchievements, listPublicProjects } from "@/modules/portfolio/repository";
import { ProjectCard } from "@/features/projects/components/project-card";
import { TutorialCard } from "@/features/tutorials/components/tutorial-card";
import { SectionHeading } from "@/components/page-intro";
import { Icon } from "@/components/icon";
import { NewsletterForm } from "@/features/contact/components/newsletter-form";
import { ContactModal } from "@/features/contact/components/contact-modal";
import { contactLinks } from "@/features/contact/platforms";

export const revalidate = 300;

export default async function HomePage() {
  const [projects, tutorials, about, links, achievements] = await Promise.all([listPublicProjects(), listPublicTutorials(3), getAbout(), listSocialLinks().catch(() => []), listPublicAchievements().catch(() => [])]);
  const location = about.location || "Ghana";
  const liveApps = projects.filter((project) => project.status === "Live" || project.status === "Beta").length;
  return <>
    <section data-tw className="relative isolate overflow-hidden bg-background pb-4" aria-label="Introduction">

      <HeroIntro about={{ bio: about.bio, education: about.education ?? [], interests: about.interests ?? [], skills: about.skills, photos: [about.photo_id, about.hero_photo_id].filter((id): id is string => Boolean(id)) }} intro={<>
          <Badge variant="outline" className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both gap-2.5 py-1.5 pr-3.5 pl-3 text-[13px] shadow-[0_1px_2px_rgb(16_27_61/0.05)] duration-700">
            <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-success"/><span className="relative inline-flex size-2 rounded-full bg-success"/></span>
            Available for freelance projects
          </Badge>
          <h1 className="mt-6 animate-in fade-in slide-in-from-bottom-4 fill-mode-both font-display text-[clamp(2.5rem,5.4vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance text-foreground delay-100 duration-700">
            Padmore Yeb
            <span className="mt-2 block bg-linear-to-r from-primary via-violet to-cyan bg-clip-text pb-[0.08em] text-[0.62em] leading-[1.12] tracking-[-0.035em] text-transparent">Web and mobile application developer.</span>
          </h1>
          <p className="mt-6 max-w-[34rem] animate-in fade-in slide-in-from-bottom-4 fill-mode-both text-lg leading-relaxed text-soft-foreground delay-200 duration-700 sm:text-xl sm:leading-relaxed">Full-stack developer based in {location}. I design and build secure, reliable web and mobile applications for businesses and individuals.</p>
          <div className="mt-9 flex animate-in flex-wrap items-center gap-3 fade-in slide-in-from-bottom-4 fill-mode-both delay-300 duration-700">
            <Button asChild size="lg" className="group shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_10px_30px_-10px_var(--primary)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_14px_36px_-10px_var(--primary)]"><Link href="/projects">View projects <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5"/></Link></Button>
            <ContactModal links={contactLinks(about, links)} triggerClassName={cn(buttonVariants({ variant: "outline", size: "lg" }), "bg-card/70 backdrop-blur")}/>
          </div>
          <div className="mt-5 tutorials-nudge-wrap"><Link href="/tutorials" className="tutorials-nudge"><span className="tutorials-nudge-icon" aria-hidden="true"><GraduationCap size={18}/></span><span className="tutorials-nudge-text"><small>Looking to learn?</small><strong>Free tutorials and guides</strong></span><span className="tutorials-nudge-live" aria-hidden="true"><i/>New</span></Link><p className="tutorials-nudge-hint">Tap to browse all tutorials, guides and downloads</p></div>
          {about.skills.length > 0 && <div className="mt-8 flex animate-in flex-wrap items-center gap-x-3 gap-y-2 fade-in fill-mode-both delay-500 duration-1000">
            <span className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Core skills</span>
            <ul className="flex flex-wrap gap-1.5">{about.skills.slice(0, 5).map((skill) => <li key={skill} className="rounded-md border border-border bg-card/60 px-2 py-0.5 font-mono text-xs text-soft-foreground">{skill}</li>)}</ul>
          </div>}
        </>} profile={<BiographyProfile about={about} achievements={achievements} projectCount={projects.length} follow={<FollowButton/>}/>} visual={
        <div className="relative mx-auto w-full max-w-xl animate-in fade-in zoom-in-95 fill-mode-both delay-150 duration-1000 lg:max-w-none">
          <div className="relative rounded-[1.75rem] bg-linear-to-br from-white via-border-strong to-white/40 p-px shadow-[0_40px_80px_-32px_rgb(16_27_61/0.4),0_12px_24px_-12px_rgb(16_27_61/0.12)] dark:from-white/20 dark:via-white/5 dark:to-white/10">
            <div className="relative aspect-[6/5] overflow-hidden rounded-[calc(1.75rem-1px)] bg-[#f3efe9]"><HeroSlideshow/></div>
          </div>

          <div className="absolute top-8 -right-3 hidden animate-float-slow items-center gap-3 rounded-2xl border border-white/70 bg-white/85 p-3 pr-4 shadow-[0_16px_40px_-16px_rgb(16_27_61/0.35)] backdrop-blur-md sm:flex lg:-right-6 dark:border-white/10 dark:bg-card/85">
            <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary"><FolderKanban className="size-[18px]"/></span>
            <span className="leading-tight"><strong className="block text-sm font-semibold text-foreground">{projects.length} projects</strong><small className="text-xs text-muted-foreground">In my portfolio</small></span>
          </div>
          <div className="absolute bottom-16 -left-3 hidden animate-float items-center gap-3 rounded-2xl border border-white/70 bg-white/85 p-3 pr-4 shadow-[0_16px_40px_-16px_rgb(16_27_61/0.35)] backdrop-blur-md sm:flex lg:-left-8 dark:border-white/10 dark:bg-card/85">
            <span className="grid size-9 place-items-center rounded-xl bg-success-soft text-success"><Sparkles className="size-[18px]"/></span>
            <span className="leading-tight"><strong className="block text-sm font-semibold text-foreground">Web &amp; mobile</strong><small className="text-xs text-muted-foreground">Full-stack development</small></span>
          </div>
        </div>}/>

      <div className="page-container">
        <HeroStats facts={[
          { value: String(projects.length), label: "Portfolio projects", href: "/projects", tone: "blue" },
          { value: String(liveApps), label: "Live projects", href: "/hosted-apps", tone: "green" },
          { value: "Web & mobile", label: "Specialisation", href: "/about", tone: "violet" },
          { value: location, label: "Location", href: "/contact", tone: "gold" },
        ]}/>
      </div>
    </section>

    <section className="page-container section-block"><SectionHeading title="Featured projects" description="Recent work, including completed and in-progress projects." href="/projects" linkLabel="View all projects"/><div className="project-grid home-project-grid">{projects.filter((project) => project.featured).map((project) => <ProjectCard key={project.slug} project={project}/>)}</div></section>

    <section className="page-container section-block"><SectionHeading title="Latest tutorials" description="Practical guides and technical write-ups on web development." href={tutorials.length > 0 ? "/tutorials" : undefined} linkLabel="View all tutorials"/>{tutorials.length > 0 ? <div className="tutorial-grid home-tutorial-grid">{tutorials.map((tutorial) => <TutorialCard key={tutorial.slug} tutorial={tutorial}/>)}</div> : <div className="newsletter-panel"><div><h2>Tutorials are coming soon</h2><p>The first guides are on their way.</p></div><a className="button button-primary" href="#stay-up-to-date">Get notified <Icon name="arrow" size={16}/></a></div>}</section>

    <section className="page-container section-block two-feature-section"><div className="feature-panel feature-panel-blue"><h2>Collaborate with me</h2><p>I&apos;m open to partnering with designers, developers and entrepreneurs on new product ideas.</p><Link href="/build-with-me" className="button button-primary">View opportunities <Icon name="arrow" size={16}/></Link></div><div className="feature-panel feature-panel-violet"><h2>Start a project</h2><p>Share your requirements and I&apos;ll respond with a proposed approach and timeline.</p><Link href="/request-project" className="button button-dark">Start a project <Icon name="arrow" size={16}/></Link></div></section>

    <section id="stay-up-to-date" className="page-container section-block newsletter-panel"><div><h2>Stay up to date</h2><p>Occasional updates on new projects and tutorials.</p></div><NewsletterForm/></section>
  </>;
}
