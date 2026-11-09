"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteImage } from "@/features/content/components/site-image";

type About = {
  bio: string;
  education: string[];
  interests: string[];
  skills: string[];
  photos: string[];
};

const panelTitle = "font-display text-[clamp(1.6rem,2.8vw,2.25rem)] font-semibold leading-tight tracking-[-0.035em] text-foreground";
const panelMotion = "animate-in fade-in slide-in-from-bottom-2 duration-500";

function Pills({ items }: { items: string[] }) {
  return <ul className="flex flex-wrap gap-2">{items.map((item) => <li key={item} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-soft-foreground shadow-[0_1px_2px_rgb(16_27_61/0.04)]">{item}</li>)}</ul>;
}

// The hero keeps its original introduction as the first tab. The other tabs
// share the same space, and only appear once there is something to show.
// "Biography" swaps the video for a full-width profile (`profile`); every other
// tab keeps the two-column layout with the video (`visual`) beside it.
export function HeroIntro({ intro, visual, profile, about }: { intro: ReactNode; visual: ReactNode; profile: ReactNode; about: About }) {
  const tabs = [
    { key: "intro", label: "Overview", show: true },
    { key: "bio", label: "About me", show: Boolean(about.bio) },
    { key: "school", label: "Education", show: about.education.length > 0 },
    { key: "interests", label: "Skills & interests", show: about.interests.length + about.skills.length > 0 },
    { key: "photos", label: "Gallery", show: about.photos.length > 0 },
  ].filter((tab) => tab.show);
  const [active, setActive] = useState("intro");
  const showProfile = active === "bio" && Boolean(about.bio);

  return <Tabs value={active} onValueChange={setActive} className="page-container relative z-10 gap-8 pt-10 pb-10 sm:pt-14 lg:pt-16 lg:pb-14">
    {tabs.length > 1 && <TabsList aria-label="Profile sections" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {tabs.map((tab) => <TabsTrigger key={tab.key} value={tab.key}>{tab.label}</TabsTrigger>)}
    </TabsList>}

    {showProfile ? <TabsContent value="bio" className="min-w-0">{profile}</TabsContent> : <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
    <div className="min-h-[clamp(300px,34vw,400px)] min-w-0">
      <TabsContent value="intro">{intro}</TabsContent>

      {about.education.length > 0 && <TabsContent value="school" className={panelMotion}>
        <h2 className={panelTitle}>Schools and programmes</h2>
        <ul className="mt-6 grid max-w-xl gap-3">{about.education.map((line) => <li key={line} className="flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-4 text-base font-semibold text-foreground backdrop-blur-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><GraduationCap className="size-5"/></span>{line}
        </li>)}</ul>
      </TabsContent>}

      {about.interests.length + about.skills.length > 0 && <TabsContent value="interests" className={panelMotion}>
        <h2 className={panelTitle}>Skills & interests</h2>
        {about.interests.length > 0 && <div className="mt-6"><Pills items={about.interests}/></div>}
        {about.skills.length > 0 && <><p className="mt-7 mb-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Technical skills</p><Pills items={about.skills}/></>}
      </TabsContent>}

      {about.photos.length > 0 && <TabsContent value="photos" className={panelMotion}>
        <h2 className={panelTitle}>Gallery</h2>
        <div className="mt-6 grid max-w-lg grid-cols-2 gap-3 [&_.site-image]:aspect-[4/5] [&_.site-image]:rounded-2xl">{about.photos.map((id) => <a key={id} href={`/media/${id}`} target="_blank" rel="noopener noreferrer" aria-label="Open photo full size" className="block overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1"><SiteImage id={id} alt="Padmore Yeb"/></a>)}</div>
      </TabsContent>}
    </div>
    {visual}
    </div>}
  </Tabs>;
}
