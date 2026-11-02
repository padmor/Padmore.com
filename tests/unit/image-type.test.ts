import { describe, expect, it } from "vitest";
import { detectImageType } from "@/modules/admin/image-type";

const bytes = (...values: number[]) => new Uint8Array(values);

describe("detectImageType", () => {
  it("recognises real image files by their contents", () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(detectImageType(new TextEncoder().encode("RIFF1234WEBPVP8 "))).toBe("image/webp");
  });
  it("refuses scripts and files that only look like images", () => {
    expect(detectImageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeNull();
    expect(detectImageType(new TextEncoder().encode("<html><script>alert(1)</script></html>"))).toBeNull();
    expect(detectImageType(new TextEncoder().encode("RIFF1234WAVEfmt "))).toBeNull();
    expect(detectImageType(bytes())).toBeNull();
  });
});
