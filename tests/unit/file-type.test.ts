import { describe, expect, it } from "vitest";
import { parseVideoUrl, videoEmbedUrl, videoWatchUrl } from "@/features/achievements/video";
import { detectFileType } from "@/modules/admin/file-type";

const bytes = (...parts: (number[] | string | Buffer)[]) => Buffer.concat(parts.map((part) => (typeof part === "string" ? Buffer.from(part, "latin1") : Buffer.from(part))));
const pad = (size: number) => Buffer.alloc(size);

describe("detectFileType", () => {
  it("accepts a PDF by its header, whatever the name", () => {
    expect(detectFileType(bytes("%PDF-1.7\n"), "anything.bin")).toEqual({ kind: "document", mime: "application/pdf" });
  });

  it("accepts Office files only when the zip holds the folder that format always has", () => {
    const zip = (folder: string) => bytes([0x50, 0x4b, 0x03, 0x04], pad(8), `${folder}document.xml`);
    expect(detectFileType(zip("word/"), "cv.docx")?.mime).toContain("wordprocessingml");
    expect(detectFileType(zip("xl/"), "sheet.xlsx")?.mime).toContain("spreadsheetml");
    expect(detectFileType(zip("ppt/"), "slides.pptx")?.mime).toContain("presentationml");
    // A zip renamed to .docx, or a .docx holding another format's folder, is refused.
    expect(detectFileType(zip("xl/"), "cv.docx")).toBeNull();
    expect(detectFileType(bytes([0x50, 0x4b, 0x03, 0x04], pad(8)), "cv.docx")).toBeNull();
  });

  it("refuses text pretending to be a PDF or an image", () => {
    expect(detectFileType(Buffer.from("just some text"), "fake.pdf")).toBeNull();
    expect(detectFileType(Buffer.from("just some text"), "fake.png")).toBeNull();
  });

  it("leaves audio, video and text for tutorials only", () => {
    const mp3 = bytes("ID3", pad(20));
    expect(detectFileType(mp3, "talk.mp3")).toBeNull();
    expect(detectFileType(mp3, "talk.mp3", { media: true })).toEqual({ kind: "audio", mime: "audio/mpeg" });
    expect(detectFileType(Buffer.from("# Notes"), "notes.md")).toBeNull();
  });

  it("recognises audio and video from their headers", () => {
    const options = { media: true };
    const mp4 = bytes([0, 0, 0, 0x20], "ftypisom", pad(20));
    expect(detectFileType(mp4, "lesson.mp4", options)).toEqual({ kind: "video", mime: "video/mp4" });
    expect(detectFileType(mp4, "lesson.m4a", options)).toEqual({ kind: "audio", mime: "audio/mp4" });
    expect(detectFileType(bytes("OggS", pad(20)), "clip.ogg", options)?.mime).toBe("audio/ogg");
    expect(detectFileType(bytes("RIFF", [0, 0, 0, 0], "WAVE", pad(8)), "clip.wav", options)?.mime).toBe("audio/wav");
    expect(detectFileType(bytes([0x1a, 0x45, 0xdf, 0xa3], pad(20)), "clip.webm", options)).toEqual({ kind: "video", mime: "video/webm" });
  });

  it("does not trust the extension alone for media", () => {
    const options = { media: true };
    expect(detectFileType(Buffer.from("not really audio"), "song.mp3", options)).toBeNull();
    expect(detectFileType(Buffer.from("not really video"), "movie.mp4", options)).toBeNull();
    // Right header, wrong name: an mp4 header called .exe is refused.
    expect(detectFileType(bytes([0, 0, 0, 0x20], "ftypisom", pad(20)), "movie.exe", options)).toBeNull();
  });

  it("accepts Markdown and text only as clean UTF-8 with a text extension", () => {
    const options = { media: true };
    expect(detectFileType(Buffer.from("# Title\n\nSome notes — with a dash."), "notes.md", options)).toEqual({ kind: "document", mime: "text/markdown" });
    expect(detectFileType(Buffer.from("plain"), "notes.txt", options)?.mime).toBe("text/plain");
    expect(detectFileType(Buffer.from([0x23, 0x00, 0x41]), "notes.md", options)).toBeNull(); // contains a binary byte
    expect(detectFileType(Buffer.from([0xff, 0xfe, 0xfd]), "notes.md", options)).toBeNull(); // not UTF-8
    expect(detectFileType(Buffer.from("<script>alert(1)</script>"), "page.html", options)).toBeNull();
  });
});

describe("parseVideoUrl", () => {
  it("accepts the usual YouTube and Vimeo link shapes and keeps only the id", () => {
    expect(parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10")).toEqual({ provider: "youtube", id: "dQw4w9WgXcQ" });
    expect(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ")).toEqual({ provider: "youtube", id: "dQw4w9WgXcQ" });
    expect(parseVideoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toEqual({ provider: "youtube", id: "dQw4w9WgXcQ" });
    expect(parseVideoUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")?.id).toBe("dQw4w9WgXcQ");
    expect(parseVideoUrl("https://vimeo.com/76979871")).toEqual({ provider: "vimeo", id: "76979871" });
    expect(parseVideoUrl("https://player.vimeo.com/video/76979871")?.id).toBe("76979871");
  });

  it("refuses other sites, other schemes and look-alike hosts", () => {
    for (const link of [
      "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://evil.example.com/watch?v=dQw4w9WgXcQ",
      "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
      "javascript:alert(1)",
      "https://www.youtube.com/watch?v=short",
      "https://vimeo.com/not-a-number",
      "not a link",
    ]) expect(parseVideoUrl(link)).toBeNull();
  });

  it("builds addresses from the id alone", () => {
    const video = { provider: "youtube" as const, id: "dQw4w9WgXcQ" };
    expect(videoWatchUrl(video)).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(videoEmbedUrl(video)).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);
  });
});
