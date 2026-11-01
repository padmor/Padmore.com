import { NextResponse } from "next/server";
import { z } from "zod";
import { listPublicProjects } from "@/modules/portfolio/repository";

const query = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50) });

export async function GET(request: Request) {
  const parsed = query.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ message: "Invalid query" }, { status: 400 });
  return NextResponse.json(
    { data: await listPublicProjects(parsed.data.limit) },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
