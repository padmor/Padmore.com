import { FileSpreadsheet, FileText, Headphones, Presentation, type LucideIcon } from "lucide-react";
import { VideoEmbed } from "@/features/achievements/components/video-embed";
import { DocumentActions, GatedImage } from "./gated-file";
import type { TutorialFile } from "@/modules/content/tutorial-files";

const TYPE_LABEL: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel spreadsheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint slides",
  "text/markdown": "Markdown notes",
  "text/plain": "Text file",
};
const OPENS_IN_BROWSER = new Set(["application/pdf", "text/markdown", "text/plain"]);
const iconFor = (mime: string | null): LucideIcon => mime?.includes("presentation") ? Presentation : mime?.includes("spreadsheet") ? FileSpreadsheet : FileText;
const size = (bytes: number | null) => bytes === null ? "" : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// Everything attached to a tutorial, grouped by what it is: documents, audio, video and images.
export function TutorialResources({ files }: { files: TutorialFile[] }) {
  if (files.length === 0) return null;
  const documents = files.filter((file) => file.kind === "document");
  const audio = files.filter((file) => file.kind === "audio");
  const videos = files.filter((file) => file.kind === "video");
  const images = files.filter((file) => file.kind === "image");

  return <section data-tw aria-labelledby="resources-heading" className="mt-12 rounded-3xl border border-border bg-card/80 p-5 sm:p-7">
    <h2 id="resources-heading" className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">Resources</h2>
    <p className="mt-1 text-sm text-muted-foreground">Files and media that go with this tutorial.</p>

    <div className="mt-6 grid gap-4">
      {videos.map((file) => file.videoUrl
        ? <VideoEmbed key={file.id} url={file.videoUrl} title={file.title}/>
        : <figure key={file.id} className="overflow-hidden rounded-2xl border border-border bg-card">
          <video controls preload="metadata" playsInline src={`/tutorial-files/${file.id}`} className="aspect-video w-full bg-black"/>
          <figcaption className="px-4 py-2.5 text-sm font-medium text-foreground">{file.title}</figcaption>
        </figure>)}

      {audio.map((file) => <div key={file.id} className="rounded-2xl border border-border bg-background/60 p-4">
        <p className="flex items-center gap-2.5 text-sm font-semibold text-foreground"><span className="grid size-9 place-items-center rounded-lg bg-violet-soft text-violet"><Headphones className="size-[18px]"/></span>{file.title}</p>
        <audio controls preload="none" src={`/tutorial-files/${file.id}`} className="mt-3 w-full"/>
      </div>)}

      {documents.map((file) => {
        const Icon = iconFor(file.mime);
        return <div key={file.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background/60 p-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-5"/></span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-[15px] font-semibold text-foreground">{file.title}</strong><small className="text-xs text-muted-foreground">{TYPE_LABEL[file.mime ?? ""] ?? "Document"} · {size(file.size)}</small></span>
          <DocumentActions id={file.id} title={file.title} canView={Boolean(file.mime && OPENS_IN_BROWSER.has(file.mime))}/>
        </div>;
      })}

      {images.length > 0 && <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((file) => <li key={file.id}><GatedImage id={file.id} title={file.title}/></li>)}</ul>}
    </div>
  </section>;
}
