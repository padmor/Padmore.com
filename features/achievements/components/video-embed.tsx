"use client";
import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import { parseVideoUrl, videoEmbedUrl, videoWatchUrl } from "../video";

// Nothing loads from YouTube or Vimeo until the visitor presses play.
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const video = parseVideoUrl(url);
  if (!video) return <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">{title} <ExternalLink className="size-3.5"/></a>;

  return <div className="overflow-hidden rounded-2xl border border-border bg-slate-900">
    <div className="relative aspect-video">
      {playing
        ? <iframe src={videoEmbedUrl(video)} title={title} className="absolute inset-0 size-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
        : <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`} className="group absolute inset-0 grid place-items-center bg-linear-to-br from-primary/80 via-violet/70 to-slate-900 text-white">
          <span className="grid size-14 place-items-center rounded-full bg-white/95 text-primary shadow-lg transition duration-300 group-hover:scale-110"><Play className="ml-0.5 size-6 fill-current"/></span>
          <span className="absolute inset-x-4 bottom-3 truncate text-left text-sm font-medium text-white/90">{title}</span>
        </button>}
    </div>
    <div className="flex items-center justify-between gap-3 bg-card px-3.5 py-2 text-xs text-muted-foreground">
      <span className="capitalize">{video.provider} video</span>
      <a href={videoWatchUrl(video)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">Open on {video.provider === "youtube" ? "YouTube" : "Vimeo"} <ExternalLink className="size-3"/></a>
    </div>
  </div>;
}
