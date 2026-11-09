import { detectImageType } from "./image-type";

// Kept under the request size most hosts allow (about 4.5 MB), so an upload is never cut off midway.
export const MAX_FILE_BYTES = 4 * 1024 * 1024;

const OFFICE = {
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", folder: "word/" },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", folder: "xl/" },
  pptx: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", folder: "ppt/" },
} as const;

export type DetectedFile = { kind: "document" | "image" | "audio" | "video"; mime: string };

const ascii = (bytes: Uint8Array, start: number, end: number) => Buffer.from(bytes.subarray(start, end)).toString("latin1");
const extensionOf = (fileName: string) => fileName.toLowerCase().split(".").pop() ?? "";

// Audio and video are recognised from their own headers, and the file extension
// only decides between the two uses of the same container (an .m4a is audio, an .mp4 is video).
function detectMedia(bytes: Buffer, extension: string): DetectedFile | null {
  const isMp3 = ascii(bytes, 0, 3) === "ID3" || (bytes[0] === 0xff && ((bytes[1] ?? 0) & 0xe0) === 0xe0);
  if (isMp3 && extension === "mp3") return { kind: "audio", mime: "audio/mpeg" };
  if (ascii(bytes, 4, 8) === "ftyp") {
    if (extension === "m4a") return { kind: "audio", mime: "audio/mp4" };
    if (extension === "mp4" || extension === "m4v") return { kind: "video", mime: "video/mp4" };
  }
  if (ascii(bytes, 0, 4) === "OggS" && ["ogg", "oga", "opus"].includes(extension)) return { kind: "audio", mime: "audio/ogg" };
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WAVE" && extension === "wav") return { kind: "audio", mime: "audio/wav" };
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3 && extension === "webm") return { kind: "video", mime: "video/webm" };
  return null;
}

// Text has no signature, so it is accepted only with a text extension, valid UTF-8 and no binary bytes.
function detectText(bytes: Buffer, extension: string): DetectedFile | null {
  if (!["md", "markdown", "txt"].includes(extension) || bytes.includes(0)) return null;
  try { new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return null; }
  return { kind: "document", mime: extension === "txt" ? "text/plain" : "text/markdown" };
}

// Reads the file's own bytes. The name and the browser's stated type can both be
// faked, so a file is only accepted when its contents match what it claims to be.
// Office files are zip archives, so the folder each format always contains is checked too.
// `media` also allows Markdown, text, audio and video, which only tutorials use.
export function detectFileType(bytes: Buffer, fileName: string, options: { media?: boolean } = {}): DetectedFile | null {
  const image = detectImageType(bytes);
  if (image) return { kind: "image", mime: image };

  if (ascii(bytes, 0, 5) === "%PDF-") return { kind: "document", mime: "application/pdf" };

  const extension = extensionOf(fileName);
  const office = OFFICE[extension as keyof typeof OFFICE];
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  if (office && isZip && bytes.includes(office.folder)) return { kind: "document", mime: office.mime };

  if (options.media) return detectMedia(bytes, extension) ?? detectText(bytes, extension);
  return null;
}

export const FILE_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
  "text/markdown": "Markdown",
  "text/plain": "Text",
  "image/jpeg": "Image",
  "image/png": "Image",
  "image/webp": "Image",
  "audio/mpeg": "Audio",
  "audio/mp4": "Audio",
  "audio/ogg": "Audio",
  "audio/wav": "Audio",
  "video/mp4": "Video",
  "video/webm": "Video",
};
