import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicProject } from "@/modules/portfolio/repository";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(200);

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const parsed = slug.safeParse((await context.params).slug);
  if (!parsed.success) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const project = await getPublicProject(parsed.data);
  if (!project) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(
    { data: project },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
