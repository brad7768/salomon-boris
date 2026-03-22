import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/content";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const index = buildSearchIndex();
  return NextResponse.json(index, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
