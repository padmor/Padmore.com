import { NextResponse } from "next/server";
import { listPublicAchievements } from "@/modules/portfolio/repository";

export async function GET() {
  return NextResponse.json(
    { data: await listPublicAchievements() },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
