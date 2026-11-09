"use client";
import { useState } from "react";
import { Download, ExternalLink, Eye, FileSpreadsheet, FileText, Presentation, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { listPublicAchievements, AchievementFile } from "@/modules/portfolio/repository";
import { VideoEmbed } from "./video-embed";

type Achievement = Awaited<ReturnType<typeof listPublicAchievements>>[number];
type Category = Achievement["category"];

const CATEGORIES: { key: Category; label: string; singular: string; chip: string }[] = [
  { key: "certificate", label: "Certificates", singular: "Certificate", chip: "bg-primary-soft text-primary" },
  { key: "award", label: "Awards", singular: "Award", chip: "bg-warning-soft text-warning" },
  { key: "milestone", label: "Work and milestones", singular: "Milestone", chip: "bg-violet-soft text-violet" },
];

const TYPE_LABEL: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel spreadsheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
};
const typeIcon = (mime: string | null): LucideIcon => mime?.includes("spreadsheet") ? FileSpreadsheet : mime?.includes("presentation") ? Presentation : FileText;
const size = (bytes: number | null) => bytes === null ? "" : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const linkButton = "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border-strong bg-card px-2.5 text-xs font-semibold text-foreground transition hover:border-muted-foreground/40 hover:bg-muted";

function FileList({ files }: { files: AchievementFile[] }) {
  const documents = files.filter((file) => file.kind === "document");
  const images = files.filter((file) => file.kind === "image");
  const videos = files.filter((file) => file.kind === "video");
  return <div className="mt-5 grid gap-3 border-t border-border pt-4">
    {documents.map((file) => {
      const Icon = typeIcon(file.mime);
      return <div key={file.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><Icon className="size-5"/></span>
        <span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold text-foreground">{file.title}</strong><small className="text-xs text-muted-foreground">{TYPE_LABEL[file.mime ?? ""] ?? "Document"} · {size(file.size)}</small></span>
        {file.mime === "application/pdf" && <a className={linkButton} href={`/achievement-files/${file.id}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${file.title}`}><Eye className="size-3.5"/>View</a>}
        <a className={linkButton} href={`/achievement-files/${file.id}?download=1`} aria-label={`Download ${file.title}`}><Download className="size-3.5"/>Download</a>
      </div>;
    })}
    {images.length > 0 && <ul className={cn("grid gap-2", images.length === 1 ? "grid-cols-1" : "grid-cols-2")}>{images.map((file) => <li key={file.id}>
      <a href={`/achievement-files/${file.id}`} target="_blank" rel="noopener noreferrer" aria-label={`Open image: ${file.title}`} className="group block overflow-hidden rounded-xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/achievement-files/${file.id}`} alt={file.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"/>
      </a>
    </li>)}</ul>}
    {videos.map((file) => file.videoUrl && <VideoEmbed key={file.id} url={file.videoUrl} title={file.title}/>)}
  </div>;
}

function Card({ item, index }: { item: Achievement; index: number }) {
  const category = CATEGORIES.find((entry) => entry.key === item.category) ?? CATEGORIES[2];
  const link = item.credentialUrl && /^https?:\/\//i.test(item.credentialUrl) ? item.credentialUrl : null;
  return <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgb(16_27_61/0.04)] transition duration-300 animate-in fade-in slide-in-from-bottom-3 fill-mode-both hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgb(16_27_61/0.35)] sm:p-6" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
    {item.imageId && <div className="-mx-1 -mt-1 mb-4 overflow-hidden rounded-2xl border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/media/${item.imageId}`} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover"/>
    </div>}
    <div className="flex items-center justify-between gap-3">
      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", category.chip)}>{category.singular}</span>
      {item.year && <span className="text-xs font-medium text-muted-foreground tabular-nums">{item.year}</span>}
    </div>
    <h3 className="mt-3 font-display text-base leading-snug font-semibold tracking-[-0.01em] text-foreground sm:text-lg">{item.title}</h3>
    {item.organization && <p className="mt-1 text-sm font-medium text-muted-foreground">{item.organization}</p>}
    {item.subtitle && <p className="mt-3 text-sm leading-relaxed text-soft-foreground">{item.subtitle}</p>}
    {link && <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Verify credential <ExternalLink className="size-3.5"/></a>}
    {item.files.length > 0 && <FileList files={item.files}/>}
  </article>;
}

export function AchievementExplorer({ achievements }: { achievements: Achievement[] }) {
  const [active, setActive] = useState<Category | "all">("all");
  const tabs = [{ key: "all" as const, label: "All", count: achievements.length }, ...CATEGORIES.map((entry) => ({ key: entry.key, label: entry.label, count: achievements.filter((item) => item.category === entry.key).length })).filter((tab) => tab.count > 0)];
  const shown = active === "all" ? achievements : achievements.filter((item) => item.category === active);

  if (achievements.length === 0) return <p className="max-w-md rounded-2xl border border-dashed border-border-strong bg-card p-10 text-center text-soft-foreground">Certificates, awards and milestones will appear here.</p>;

  return <div>
    {tabs.length > 2 && <div role="group" aria-label="Filter achievements" className="mb-6 flex w-fit max-w-full flex-wrap gap-1 rounded-full border border-border bg-muted/80 p-1">
      {tabs.map((tab) => <button key={tab.key} type="button" aria-pressed={active === tab.key} onClick={() => setActive(tab.key)}
        className={cn("inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition", active === tab.key ? "bg-card text-foreground shadow-[0_1px_3px_rgb(16_27_61/0.1),0_0_0_1px_var(--border)]" : "text-muted-foreground hover:text-foreground")}>
        {tab.label}<span className="rounded-full bg-background/80 px-1.5 text-[11px] tabular-nums">{tab.count}</span>
      </button>)}
    </div>}
    <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">{shown.map((item, index) => <Card key={item.id} item={item} index={index}/>)}</div>
  </div>;
}
