import { describe, expect, it } from "vitest";
import { toProject, type ProjectRow } from "@/modules/portfolio/mappers";

const row: ProjectRow = {
  slug: "s",
  title: "T",
  summary: "D",
  projectType: "Web",
  category: "Web Apps",
  artwork: "chat",
  lifecycleStatus: "live",
  isFeatured: true,
  updatedAt: "2026-03-15T00:00:00Z",
};

describe("toProject", () => {
  it("maps database values to the interface", () => {
    expect(toProject(row, ["React"])).toMatchObject({ status: "Live", visual: "chat", stack: ["React"], updated: "Updated Mar 2026" });
  });
  it("falls back safely on unknown values", () => {
    const mapped = toProject({ ...row, lifecycleStatus: "unknown", artwork: "bad", projectType: null, summary: null, category: null }, []);
    expect(mapped).toMatchObject({ status: "In Progress", visual: "portfolio", type: "Project", description: "", category: "Other" });
  });
  it("never passes through internal columns", () => {
    const leaky = { ...row, id: "secret-id", createdBy: "user-id", repositoryUrl: "private" } as ProjectRow;
    const mapped = toProject(leaky, []);
    for (const key of ["id", "createdBy", "repositoryUrl"]) expect(mapped).not.toHaveProperty(key);
  });
});
