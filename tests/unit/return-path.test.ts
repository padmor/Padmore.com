import { describe, expect, it } from "vitest";
import { returnPathOrDefault, safeReturnPath } from "@/lib/auth/return-path";

describe("safeReturnPath", () => {
  it("accepts ordinary pages on this site", () => {
    for (const path of ["/", "/about", "/community", "/community?sort=top", "/tutorials/react-basics", "/projects/my-app", "/achievements"]) {
      expect(safeReturnPath(path)).toBe(path);
    }
  });

  it("refuses other sites and scheme tricks", () => {
    for (const value of [
      "https://evil.example.com",
      "http://evil.example.com/about",
      "//evil.example.com",
      "///evil.example.com",
      "/\\evil.example.com",
      "\\\\evil.example.com",
      "javascript:alert(1)",
      "data:text/html,hi",
      "evil.example.com",
      "about",
      "",
    ]) expect(safeReturnPath(value), value).toBeNull();
  });

  it("refuses encoded slashes, backslashes and control characters", () => {
    for (const value of ["/%2f%2fevil.example.com", "/%2F/evil.example.com", "/%5cevil.example.com", "/%5Cevil.example.com", "/about%0d%0aSet-Cookie:x=1", "/about%00", "/%E0%A4%A"]) {
      expect(safeReturnPath(value), value).toBeNull();
    }
  });

  it("refuses characters outside the plain set, and anything too long", () => {
    for (const value of ["/about page", "/about<script>", "/about\"onload", "/about'", "/a;b", "/" + "a".repeat(200)]) {
      expect(safeReturnPath(value), value).toBeNull();
    }
  });

  it("refuses values that are not text", () => {
    for (const value of [undefined, null, 5, {}, ["/about"]]) expect(safeReturnPath(value)).toBeNull();
  });

  it("does not return people to a sign-in page, which would loop", () => {
    for (const value of ["/signin", "/signup", "/signin?next=/about", "/forgot-password", "/reset-password"]) expect(safeReturnPath(value), value).toBeNull();
    expect(safeReturnPath("/signing-tips")).toBe("/signing-tips");
  });
});

describe("returnPathOrDefault", () => {
  it("falls back to the dashboard for anything unsafe or missing", () => {
    expect(returnPathOrDefault("/about")).toBe("/about");
    expect(returnPathOrDefault("https://evil.example.com")).toBe("/dashboard");
    expect(returnPathOrDefault(null)).toBe("/dashboard");
  });
});
