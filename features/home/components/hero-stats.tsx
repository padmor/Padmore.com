"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderKanban, Layers, MapPin, Rocket, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroCardArt } from "./hero-card-art";

export type HeroFact = { value: string; label: string; href: string; tone: Tone };
type Tone = "blue" | "green" | "violet" | "gold";

const TONES: Record<Tone, { icon: LucideIcon; chip: string; glow: string; hover: string }> = {
  blue: { icon: FolderKanban, chip: "bg-primary-soft text-primary", glow: "bg-primary/25", hover: "hover:border-primary/40" },
  green: { icon: Rocket, chip: "bg-success-soft text-success", glow: "bg-success/25", hover: "hover:border-success/40" },
  violet: { icon: Layers, chip: "bg-violet-soft text-violet", glow: "bg-violet/25", hover: "hover:border-violet/40" },
  gold: { icon: MapPin, chip: "bg-warning-soft text-warning", glow: "bg-warning/25", hover: "hover:border-warning/40" },
};

// Whole numbers count up from zero the first time the strip scrolls into view.
function CountUp({ value }: { value: string }) {
  const target = /^\d+$/.test(value) ? Number(value) : null;
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (target === null || target === 0 || !element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 1100);
        setShown(String(Math.round(target * (1 - Math.pow(1 - progress, 3)))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.15 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [target]);

  return <span ref={ref}>{shown}</span>;
}

export function HeroStats({ facts }: { facts: HeroFact[] }) {
  return <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    {facts.map((fact, index) => {
      const tone = TONES[fact.tone];
      const ToneIcon = tone.icon;
      return <li key={fact.label} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700" style={{ animationDelay: `${450 + index * 90}ms` }}>
        <Link href={fact.href} className={cn("group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card/80 p-4 shadow-[0_1px_2px_rgb(16_27_61/0.04)] backdrop-blur-sm transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(16_27_61/0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-0 sm:p-6", tone.hover)}>
          <span aria-hidden="true" className={cn("pointer-events-none absolute -right-12 -bottom-12 size-36 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100", tone.glow)}/>
          <span className="relative block">
            <HeroCardArt tone={fact.tone}/>
            <span className={cn("absolute top-2 left-2 grid size-8 place-items-center rounded-lg shadow-sm", tone.chip)}><ToneIcon className="size-4" strokeWidth={2}/></span>
            <ArrowUpRight className="absolute top-2.5 right-2.5 size-4 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition duration-300 group-hover:translate-0 group-hover:opacity-100 group-focus-visible:translate-0 group-focus-visible:opacity-100" aria-hidden="true"/>
          </span>
          <span className="relative">
            <span className="block font-display text-2xl font-semibold tracking-[-0.03em] text-foreground tabular-nums sm:text-[1.75rem] sm:leading-tight"><CountUp value={fact.value}/></span>
            <span className="mt-1 block text-[13px] font-medium text-muted-foreground sm:text-sm">{fact.label}</span>
          </span>
        </Link>
      </li>;
    })}
  </ul>;
}
