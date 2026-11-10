import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Award, Briefcase, Compass, ExternalLink, GraduationCap, Mail, MapPin, Phone, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleBody } from "@/features/content/components/article-body";
import type { AboutContent } from "@/modules/admin/collections";
import type { listPublicAchievements } from "@/modules/portfolio/repository";

type Achievement = Awaited<ReturnType<typeof listPublicAchievements>>[number];

// "Role · Organisation · Years · What you did": the portal asks for one entry
// per line, so the parts are split here. Missing parts are simply left out.
const parts = (line: string) => line.split(/\s+[·|]\s+/).map((part) => part.trim()).filter(Boolean);

const eyebrow = "text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase";
const card = "rounded-3xl border border-border bg-card/80 p-6 shadow-[0_1px_2px_rgb(16_27_61/0.04)] backdrop-blur-sm sm:p-8";

function Reveal({ index, className, children }: { index: number; className?: string; children: ReactNode }) {
  return <div className={`animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700 ${className ?? ""}`} style={{ animationDelay: `${index * 90}ms` }}>{children}</div>;
}

function SectionTitle({ icon: Icon, label, title, tone }: { icon: typeof Award; label: string; title: string; tone: string }) {
  return <div className="mb-6 flex items-center gap-3">
    <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="size-5"/></span>
    <div><p className={eyebrow}>{label}</p><h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">{title}</h3></div>
  </div>;
}

function Timeline({ items, icon: Icon }: { items: { title: string; meta: string[]; note?: string }[]; icon: typeof Award }) {
  return <ol className="relative grid gap-6 before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-px before:bg-border">
    {items.map((item) => <li key={item.title + item.meta.join()} className="relative flex gap-4">
      <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-primary shadow-sm"><Icon className="size-4"/></span>
      <div className="min-w-0 pt-1">
        <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
        {item.meta.length > 0 && <p className="mt-0.5 text-sm font-medium text-muted-foreground">{item.meta.join(" · ")}</p>}
        {item.note && <p className="mt-2 text-sm leading-relaxed text-soft-foreground">{item.note}</p>}
      </div>
    </li>)}
  </ol>;
}

function Photo({ id, className }: { id: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/media/${id}`} alt="Padmore Yeb" loading="lazy" className={className}/>;
}

export function BiographyProfile({ about, achievements, projectCount, showFullStory = true, follow }: { about: AboutContent; achievements: Achievement[]; projectCount: number; showFullStory?: boolean; follow?: ReactNode }) {
  const portrait = about.photo_id ?? about.hero_photo_id ?? null;
  const gallery = [about.photo_id, about.hero_photo_id].filter((id): id is string => Boolean(id) && id !== portrait);
  const experience = (about.experience ?? []).map((line) => { const [title, ...rest] = parts(line); return { title, meta: rest.slice(0, 2), note: rest.slice(2).join(" · ") || undefined }; });
  const education = (about.education ?? []).map((line) => { const [title, ...rest] = parts(line); return { title, meta: rest, note: undefined as string | undefined }; });
  const facts = [
    { icon: MapPin, text: about.location },
    { icon: Mail, text: about.email },
    { icon: Phone, text: about.phone },
  ].filter((fact): fact is { icon: typeof MapPin; text: string } => Boolean(fact.text));
  const numbers = [
    { value: String(projectCount), label: "Projects" },
    { value: String(education.length), label: education.length === 1 ? "School" : "Schools" },
    { value: String(achievements.length), label: "Credentials & milestones" },
    { value: String(about.skills.length), label: "Skills" },
  ].filter((item) => item.value !== "0");
  let step = 0;

  return <div className="grid gap-6 pb-6 lg:gap-8">
    {/* Who I am */}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-10">
      <Reveal index={step++} className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_32px_64px_-32px_rgb(16_27_61/0.35)]">
          <div className="relative aspect-[4/5] overflow-hidden bg-linear-to-br from-primary-soft via-violet-soft to-cyan-soft">
            {portrait
              ? <Photo id={portrait} className="size-full object-cover"/>
              : <div className="grid size-full place-items-center font-display text-7xl font-semibold text-primary/40">PY</div>}
            <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/60 bg-white/85 p-3.5 backdrop-blur-md dark:border-white/10 dark:bg-card/85">
              <p className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground">Padmore Yeb</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-success"/><span className="relative inline-flex size-2 rounded-full bg-success"/></span>Web developer · Available for projects</p>
            </div>
          </div>
          {facts.length > 0 && <ul className="grid gap-3 p-5 text-sm text-soft-foreground">{facts.map(({ icon: Icon, text }) => <li key={text} className="flex items-center gap-3"><Icon className="size-4 shrink-0 text-primary"/><span className="min-w-0 break-words">{text}</span></li>)}</ul>}
          {follow && <div className="border-t border-border p-5">{follow}</div>}
        </div>
      </Reveal>

      <div className="grid min-w-0 content-start gap-6">
        <Reveal index={step++} className={card}>
          <p className={eyebrow}>Biography</p>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-balance text-foreground">{about.headline}</h2>
          {about.intro && <p className="mt-4 text-lg leading-relaxed text-soft-foreground">{about.intro}</p>}
          <div className="mt-6 border-t border-border pt-6 text-base leading-relaxed text-soft-foreground xl:columns-2 xl:gap-12 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_p]:break-inside-avoid"><ArticleBody text={about.bio}/></div>
        </Reveal>

        {numbers.length > 0 && <Reveal index={step++}><ul className={`grid gap-3 ${numbers.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"}`}>{numbers.map((item) => <li key={item.label} className="rounded-2xl border border-border bg-card/80 p-4 text-center backdrop-blur-sm">
          <p className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground tabular-nums">{item.value}</p><p className="mt-0.5 text-xs font-medium text-muted-foreground">{item.label}</p>
        </li>)}</ul></Reveal>}

        {(about.mission || about.vision) && <div className="grid gap-6 sm:grid-cols-2">
          {about.mission && <Reveal index={step++} className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-[#2f55dc] p-6 text-white shadow-[0_24px_48px_-24px_var(--primary)] sm:p-7">
            <span aria-hidden="true" className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl"/>
            <span className="relative grid size-10 place-items-center rounded-xl bg-white/15"><Target className="size-5"/></span>
            <h3 className="relative mt-5 font-display text-xl font-semibold tracking-[-0.03em]">My mission</h3>
            <p className="relative mt-2 text-[15px] leading-relaxed text-white/90">{about.mission}</p>
          </Reveal>}
          {about.vision && <Reveal index={step++} className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet to-[#5b3bc4] p-6 text-white shadow-[0_24px_48px_-24px_var(--violet)] sm:p-7">
            <span aria-hidden="true" className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl"/>
            <span className="relative grid size-10 place-items-center rounded-xl bg-white/15"><Compass className="size-5"/></span>
            <h3 className="relative mt-5 font-display text-xl font-semibold tracking-[-0.03em]">My vision</h3>
            <p className="relative mt-2 text-[15px] leading-relaxed text-white/90">{about.vision}</p>
          </Reveal>}
        </div>}
      </div>
    </div>

    {/* Experience, and schools and programmes (always shown, so there is a clear place for them) */}
    <div className={`grid gap-6 ${experience.length > 0 ? "lg:grid-cols-2" : ""}`}>
      {experience.length > 0 && <Reveal index={step++} className={card}><SectionTitle icon={Briefcase} label="Experience" title="Professional experience" tone="bg-primary-soft text-primary"/><Timeline items={experience} icon={Briefcase}/></Reveal>}
      <Reveal index={step++} className={card}>
        <SectionTitle icon={GraduationCap} label="Education" title="Schools and programmes" tone="bg-success-soft text-success"/>
        {education.length > 0 ? <Timeline items={education} icon={GraduationCap}/> : <p className="text-sm leading-relaxed text-muted-foreground">The schools attended and programmes studied will be listed here.</p>}
      </Reveal>
    </div>

    {/* Certificates */}
    {achievements.length > 0 && <Reveal index={step++} className={card}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <SectionTitle icon={Award} label="Credentials" title="Certifications and achievements" tone="bg-warning-soft text-warning"/>
        <Link href="/achievements" className="group mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">View all <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5"/></Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{achievements.slice(0, 6).map((item) => {
        const link = item.credentialUrl && /^https?:\/\//i.test(item.credentialUrl) ? item.credentialUrl : null;
        return <li key={item.title} className="group flex gap-4 rounded-2xl border border-border bg-background/60 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-warning/40 hover:shadow-[0_16px_32px_-20px_rgb(16_27_61/0.3)]">
          <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-warning-soft text-2xl text-warning">{item.imageId ? <Photo id={item.imageId} className="size-full object-cover"/> : item.icon}</span>
          <div className="min-w-0">
            <h4 className="text-[15px] leading-snug font-semibold text-foreground">{item.title}</h4>
            <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">{[item.organization, item.year].filter(Boolean).join(" · ")}</p>
            {item.subtitle && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-soft-foreground">{item.subtitle}</p>}
            {link && <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Verify credential <ExternalLink className="size-3"/></a>}
          </div>
        </li>;
      })}</ul>
    </Reveal>}

    {/* More photos, skills and interests */}
    {gallery.length > 0 && <Reveal index={step++}><div className={`grid gap-4 ${gallery.length > 1 ? "sm:grid-cols-2" : ""}`}>{gallery.map((id) => <a key={id} href={`/media/${id}`} target="_blank" rel="noopener noreferrer" aria-label="Open photo full size" className="group block overflow-hidden rounded-3xl border border-border"><Photo id={id} className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"/></a>)}</div></Reveal>}

    {(about.skills.length > 0 || (about.interests ?? []).length > 0) && <Reveal index={step++} className={`${card} grid gap-8 ${about.skills.length > 0 && (about.interests ?? []).length > 0 ? "md:grid-cols-2" : ""}`}>
      {about.skills.length > 0 && <div><SectionTitle icon={Sparkles} label="Expertise" title="Technical skills" tone="bg-violet-soft text-violet"/><ul className="flex flex-wrap gap-2">{about.skills.map((skill) => <li key={skill} className="rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-sm font-medium text-soft-foreground">{skill}</li>)}</ul></div>}
      {(about.interests ?? []).length > 0 && <div><SectionTitle icon={Compass} label="Outside work" title="Interests" tone="bg-cyan-soft text-cyan"/><ul className="flex flex-wrap gap-2">{(about.interests ?? []).map((item) => <li key={item} className="rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-sm font-medium text-soft-foreground">{item}</li>)}</ul></div>}
    </Reveal>}

    {/* Call to action */}
    <Reveal index={step++} className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-foreground p-6 text-background sm:p-8">
      <div><h3 className="font-display text-xl font-semibold tracking-[-0.03em] sm:text-2xl">Let&apos;s work together</h3><p className="mt-1 text-sm opacity-75">Share your requirements and I&apos;ll respond with a proposed approach and timeline.</p></div>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg" className="bg-background text-foreground shadow-none hover:bg-background/90"><Link href="/request-project">Start a project <ArrowRight/></Link></Button>
        {showFullStory ? <Button asChild size="lg" variant="ghost" className="text-background hover:bg-white/10 hover:text-background"><Link href="/about">Full story</Link></Button> : <Button asChild size="lg" variant="ghost" className="text-background hover:bg-white/10 hover:text-background"><Link href="/contact">Get in touch</Link></Button>}
      </div>
    </Reveal>
  </div>;
}
