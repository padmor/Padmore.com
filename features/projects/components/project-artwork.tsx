import type { Project } from "@/lib/data";

export function ProjectArtwork({ visual, compact = false }: { visual: Project["visual"] | "design" | "toolkit" | "react" | "bundle"; compact?: boolean }) {
  return (
    <div className={`project-artwork art-${visual}${compact ? " compact" : ""}`} aria-hidden="true">
      <div className="art-window">
        <div className="art-window-top"><i/><i/><i/><span/></div>
        <div className="art-window-body">
          <div className="art-side"><b/><b/><b/><b/></div>
          <div className="art-main"><div className="art-title-line"/><div className="art-stats"><i/><i/><i/></div><div className="art-chart"><span/><span/><span/><span/><span/><span/><span/></div><div className="art-lower"><i/><i/></div></div>
        </div>
      </div>
      <div className="art-floating-card"><span/><b/><i/></div>
    </div>
  );
}
