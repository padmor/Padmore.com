"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { ArticleBody } from "@/features/content/components/article-body";
import { SiteImage } from "@/features/content/components/site-image";

type About = {
  headline: string;
  bio: string;
  education: string[];
  interests: string[];
  skills: string[];
  photos: string[];
};

// The hero keeps its original introduction as the first tab. The other tabs
// share the same space, and only appear once there is something to show.
export function HeroIntro({ intro, about }: { intro: ReactNode; about: About }) {
  const tabs = [
    { key: "intro", label: "Intro", show: true },
    { key: "bio", label: "Biography", show: Boolean(about.bio) },
    { key: "school", label: "School", show: about.education.length > 0 },
    { key: "interests", label: "Interests", show: about.interests.length + about.skills.length > 0 },
    { key: "photos", label: "Photos", show: about.photos.length > 0 },
  ].filter((tab) => tab.show);
  const [active, setActive] = useState("intro");

  return <div className="hero-copy">
    {tabs.length > 1 && <div className="hero-tabs" role="tablist" aria-label="About Padmore">
      {tabs.map((tab) => <button key={tab.key} type="button" role="tab" id={`hero-tab-${tab.key}`} aria-controls={`hero-panel-${tab.key}`} aria-selected={active === tab.key} className={active === tab.key ? "hero-tab active" : "hero-tab"} onClick={() => setActive(tab.key)}>{tab.label}</button>)}
    </div>}

    <div className="hero-panel" role="tabpanel" id={`hero-panel-${active}`} aria-labelledby={`hero-tab-${active}`}>
      {active === "intro" && intro}

      {active === "bio" && <>
        <span className="eyebrow">BIOGRAPHY</span>
        <h2 className="hero-panel-title">{about.headline}</h2>
        <div className="hero-panel-text"><ArticleBody text={about.bio}/></div>
        <Link className="text-link" href="/about">Read my full story <Icon name="arrow" size={15}/></Link>
      </>}

      {active === "school" && <>
        <span className="eyebrow">EDUCATION</span>
        <h2 className="hero-panel-title">Where I've studied</h2>
        <ul className="hero-school-list">{about.education.map((line) => <li key={line}><span className="hero-school-icon"><Icon name="book" size={16}/></span>{line}</li>)}</ul>
      </>}

      {active === "interests" && <>
        <span className="eyebrow">INTERESTS</span>
        <h2 className="hero-panel-title">What I enjoy</h2>
        {about.interests.length > 0 && <div className="skill-cloud">{about.interests.map((item) => <span className="skill-pill" key={item}>{item}</span>)}</div>}
        {about.skills.length > 0 && <><p className="hero-panel-label">Skills I work with</p><div className="skill-cloud">{about.skills.map((item) => <span className="skill-pill" key={item}>{item}</span>)}</div></>}
      </>}

      {active === "photos" && <>
        <span className="eyebrow">PHOTOS</span>
        <h2 className="hero-panel-title">A little more of me</h2>
        <div className="hero-photo-grid">{about.photos.map((id) => <a key={id} href={`/media/${id}`} target="_blank" rel="noopener noreferrer" aria-label="Open photo full size"><SiteImage id={id} alt="Padmore Yeb"/></a>)}</div>
      </>}
    </div>
  </div>;
}
