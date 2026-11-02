"use client";
import { useEffect, useState } from "react";
import { MAX_IMAGE_BYTES } from "@/modules/admin/image-type";

/* eslint-disable @next/next/no-img-element */
export function ImageField({ label = "Image", currentId }: { label?: string; currentId?: string | null }) {
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return <div className="field admin-field-wide">
    <span className="admin-image-label">{label} <small>Optional. JPEG, PNG or WebP, up to 2 MB</small></span>
    {currentId && !preview && <div className="admin-image-current">
      <a href={`/media/${currentId}`} target="_blank" rel="noopener noreferrer" aria-label="Open the attached image full size"><img src={`/media/${currentId}`} alt="Attached"/></a>
      <div>
        <strong>Attached</strong>
        <a className="text-link" href={`/media/${currentId}`} target="_blank" rel="noopener noreferrer">View full size</a>
        <label><input type="checkbox" name="remove_image"/> Remove this image</label>
      </div>
    </div>}
    {preview && <div className="admin-image-current">
      <img src={preview} alt="Preview of the chosen file"/>
      <div><strong>Ready to attach</strong><small>Saved when you save this form.</small></div>
    </div>}
    <label className="button button-outline button-small admin-attach" htmlFor="content-image">{currentId || preview ? "Attach a different image" : "Attach image"}</label>
    <input id="content-image" className="sr-only" name="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
      const file = event.target.files?.[0];
      const tooBig = (file?.size ?? 0) > MAX_IMAGE_BYTES;
      setError(tooBig ? "That image is over 2 MB. Please choose a smaller one." : "");
      if (tooBig) event.target.value = "";
      setPreview(file && !tooBig ? URL.createObjectURL(file) : null);
    }}/>
    {error && <small role="alert" className="admin-image-error">{error}</small>}
  </div>;
}
