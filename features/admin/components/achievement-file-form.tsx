"use client";
import { useActionState, useEffect, useRef } from "react";
import { Icon } from "@/components/icon";
import { addAchievementFileAction, type FileFormState } from "@/modules/admin/achievement-file-actions";

const initial: FileFormState = {};

export function AchievementFileForm({ achievementId }: { achievementId: string }) {
  const [state, action, pending] = useActionState(addAchievementFileAction, initial);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.added) form.current?.reset(); }, [state.added]);

  return <form ref={form} action={action} className="admin-form" style={{ marginTop: 8 }}>
    <input type="hidden" name="achievementId" value={achievementId}/>
    <div className="field"><label htmlFor="file-title">Title <small>Optional. The file name is used if left empty</small></label><input id="file-title" name="title" maxLength={150} placeholder="For example: Certificate of completion"/></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="file-upload">Upload a file <small>PDF, Word, Excel, PowerPoint, JPEG, PNG or WebP, up to 4 MB</small></label><input id="file-upload" name="file" type="file" accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png,.webp"/></div>
      <div className="field"><label htmlFor="file-video">Or add a video <small>A YouTube or Vimeo link</small></label><input id="file-video" name="video_url" type="url" maxLength={2048} placeholder="https://www.youtube.com/watch?v=…"/></div>
    </div>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {state.added && !state.error && !pending && <div className="inline-notice" role="status"><Icon name="check"/> Added. It is now on the Achievements page if the item is published.</div>}
    <div className="admin-form-actions"><button className="button button-primary" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Uploading…" : "Attach"}</button></div>
  </form>;
}
