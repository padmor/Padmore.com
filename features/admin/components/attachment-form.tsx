"use client";
import { useActionState, useEffect, useRef } from "react";
import { Icon } from "@/components/icon";

type State = { error?: string; added?: number };

// One form for attaching a file or a video link to an item. The save action and
// the file types it accepts come from the section that uses it.
export function AttachmentForm({ action, parentId, accept, fileHelp }: { action: (state: State, formData: FormData) => Promise<State>; parentId: string; accept: string; fileHelp: string }) {
  const [state, run, pending] = useActionState(action, {} as State);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.added) form.current?.reset(); }, [state.added]);

  return <form ref={form} action={run} className="admin-form" style={{ marginTop: 8 }}>
    <input type="hidden" name="parentId" value={parentId}/>
    <div className="field"><label htmlFor="file-title">Title <small>Optional. The file name is used if left empty</small></label><input id="file-title" name="title" maxLength={150} placeholder="For example: Slides, Starter files, Audio walkthrough"/></div>
    <div className="form-grid two-col">
      <div className="field"><label htmlFor="file-upload">Upload a file <small>{fileHelp}</small></label><input id="file-upload" name="file" type="file" accept={accept}/></div>
      <div className="field"><label htmlFor="file-video">Or add a video <small>A YouTube or Vimeo link, best for long videos</small></label><input id="file-video" name="video_url" type="url" maxLength={2048} placeholder="https://www.youtube.com/watch?v=…"/></div>
    </div>
    {state.error && <div className="inline-notice" role="alert"><Icon name="info"/> {state.error}</div>}
    {state.added && !state.error && !pending && <div className="inline-notice" role="status"><Icon name="check"/> Added. It shows on the tutorial once the tutorial is published.</div>}
    <div className="admin-form-actions"><button className="button button-primary" type="submit" disabled={pending} aria-busy={pending}>{pending ? "Uploading…" : "Attach"}</button></div>
  </form>;
}
