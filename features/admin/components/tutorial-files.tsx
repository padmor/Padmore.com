import { FILE_LABELS } from "@/modules/admin/file-type";
import { addTutorialFileAction, removeTutorialFileAction } from "@/modules/admin/tutorial-file-actions";
import { listTutorialFiles, type TutorialFile } from "@/modules/content/tutorial-files";
import { AttachmentForm } from "./attachment-form";
import { SubmitButton } from "@/components/submit-button";

const size = (bytes: number | null) => bytes === null ? "" : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const ACCEPT = ".pdf,.docx,.xlsx,.pptx,.md,.markdown,.txt,.jpg,.jpeg,.png,.webp,.mp3,.m4a,.ogg,.oga,.opus,.wav,.mp4,.m4v,.webm";

// Files attached to one tutorial: documents, slides, Markdown, images, audio and video.
export async function TutorialFiles({ postId }: { postId: string }) {
  // Until the files table exists the section still opens, and says so.
  let files: TutorialFile[] = [];
  let unavailable = false;
  try { files = await listTutorialFiles(postId); } catch { unavailable = true; }

  return <section className="form-card admin-form" aria-labelledby="tutorial-files-heading" style={{ marginTop: 24 }}>
    <h2 id="tutorial-files-heading" style={{ margin: 0, fontSize: 18 }}>Files and media</h2>
    <p className="muted-copy">Attach slides, PDFs, Markdown notes, images, audio recordings or videos. Visitors see them under Resources on the tutorial once it is published.</p>
    {unavailable
      ? <div className="inline-notice" role="alert">File attachments are not set up on the database yet. Run <code>npm run db:migrate</code>, then reload this page.</div>
      : <>
        {files.length > 0
          ? <ul style={{ display: "grid", gap: 8, margin: "12px 0", padding: 0, listStyle: "none" }}>{files.map((file) => <li key={file.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 12 }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: "block", overflowWrap: "anywhere" }}>{file.title}</strong>
              <small className="muted-copy">{file.videoUrl ? "Video link" : `${FILE_LABELS[file.mime ?? ""] ?? "File"} · ${size(file.size)}`}</small>
            </span>
            <a className="button button-small button-outline" href={file.videoUrl ?? `/tutorial-files/${file.id}`} target="_blank" rel="noopener noreferrer">{file.videoUrl ? "Open" : "View"}</a>
            <form action={removeTutorialFileAction}><input type="hidden" name="fileId" value={file.id}/><SubmitButton className="button button-small admin-danger" type="submit">Remove</SubmitButton></form>
          </li>)}</ul>
          : <p className="muted-copy">Nothing attached yet.</p>}
        <AttachmentForm action={addTutorialFileAction} parentId={postId} accept={ACCEPT} fileHelp="PDF, Word, Excel, PowerPoint, Markdown, text, image, audio or video, up to 4 MB"/>
      </>}
  </section>;
}
