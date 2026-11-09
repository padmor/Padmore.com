import { FILE_LABELS } from "@/modules/admin/file-type";
import { removeAchievementFileAction } from "@/modules/admin/achievement-file-actions";
import { listAchievementFiles, type AchievementFile } from "@/modules/portfolio/repository";
import { AchievementFileForm } from "./achievement-file-form";
import { SubmitButton } from "@/components/submit-button";

const size = (bytes: number | null) => bytes === null ? "" : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

// Files attached to one achievement: certificates as PDFs or images, documents, and video links.
export async function AchievementFiles({ achievementId }: { achievementId: string }) {
  const files = (await listAchievementFiles([achievementId]).catch(() => new Map<string, AchievementFile[]>())).get(achievementId) ?? [];
  return <section className="form-card admin-form" aria-labelledby="achievement-files-heading" style={{ marginTop: 24 }}>
    <h2 id="achievement-files-heading" style={{ margin: 0, fontSize: 18 }}>Files and videos</h2>
    <p className="muted-copy">Attach the certificate itself, supporting documents, images or videos. Visitors see these on the Achievements page once the item is published.</p>
    {files.length > 0
      ? <ul style={{ display: "grid", gap: 8, margin: "12px 0", padding: 0, listStyle: "none" }}>{files.map((file) => <li key={file.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 12 }}>
        <span style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ display: "block", overflowWrap: "anywhere" }}>{file.title}</strong>
          <small className="muted-copy">{file.kind === "video" ? "Video link" : `${FILE_LABELS[file.mime ?? ""] ?? "File"} · ${size(file.size)}`}</small>
        </span>
        {file.kind === "video"
          ? <a className="button button-small button-outline" href={file.videoUrl ?? "#"} target="_blank" rel="noopener noreferrer">Open</a>
          : <a className="button button-small button-outline" href={`/achievement-files/${file.id}`} target="_blank" rel="noopener noreferrer">View</a>}
        <form action={removeAchievementFileAction}><input type="hidden" name="fileId" value={file.id}/><SubmitButton className="button button-small admin-danger" type="submit">Remove</SubmitButton></form>
      </li>)}</ul>
      : <p className="muted-copy">Nothing attached yet.</p>}
    <AchievementFileForm achievementId={achievementId}/>
  </section>;
}
