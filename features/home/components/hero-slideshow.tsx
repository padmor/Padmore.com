"use client";
import { useEffect, useRef, useState } from "react";

// Played in turn on a loop. Each one is landscape, with its own captions in the
// top-left corner that the CSS zoom keeps out of view.
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

  return <>{VIDEOS.map((video, index) => <div key={video.src} className={`hero-slide${active === index ? " is-active" : ""}`} aria-hidden={active !== index}>
    <video ref={(element) => { videos.current[index] = element; }} className="hero-video" style={{ objectPosition: video.position, transformOrigin: video.position }} src={video.src} muted playsInline preload={index === 0 ? "auto" : "metadata"} onEnded={() => { if (active === index) next(); }} aria-label={video.label}/>
  </div>)}</>;
}
