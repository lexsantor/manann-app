import { NextRequest, NextResponse } from "next/server";
import { searchTaric } from "@/lib/taric-data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json([]);
  const results = searchTaric(q, 8);
  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
