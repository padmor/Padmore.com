"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Played in turn on a loop. Each one is landscape, with its own captions in the
// top-left corner that the zoom (scale-[1.26]) keeps out of view.
const VIDEOS = [
  { src: "/videos/hero/developer-coding.mp4", label: "An animated developer sitting down, planning and then coding", position: "42% 100%" },
  { src: "/videos/hero/team-success.mp4", label: "The developer and a teammate sharing ideas, planning a strategy and celebrating success", position: "50% 100%" },
];
// Moves on even if a video can't play, for example when autoplay is blocked.
const VIDEO_FALLBACK_MS = 12000;

export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const next = () => setActive((current) => (current + 1) % VIDEOS.length);

  useEffect(() => {
    videos.current.forEach((video, index) => { if (video && index !== active) video.pause(); });
    // People who ask for less motion see a still first video.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const video = videos.current[active];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    const timer = window.setTimeout(next, VIDEO_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  return <>
    {VIDEOS.map((video, index) => <div key={video.src} className={cn("absolute inset-0 transition-opacity duration-1000 ease-out", active === index ? "opacity-100" : "opacity-0")} aria-hidden={active !== index}>
      <video ref={(element) => { videos.current[index] = element; }} className="size-full scale-[1.26] object-cover" style={{ objectPosition: video.position, transformOrigin: video.position }} src={video.src} muted playsInline preload={index === 0 ? "auto" : "metadata"} onEnded={() => { if (active === index) next(); }} aria-label={video.label}/>
    </div>)}
    <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900/30 px-2.5 py-2 backdrop-blur-md">
      {VIDEOS.map((video, index) => <button key={video.src} type="button" onClick={() => setActive(index)} aria-label={`Play video ${index + 1} of ${VIDEOS.length}`} aria-pressed={active === index} className={cn("h-1.5 rounded-full transition-all duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white", active === index ? "w-6 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80")}/>)}
    </div>
  </>;
}
