import { NextResponse } from "next/server";

import { getSupabaseStoragePublicUrl } from "@/lib/env";

const allowedBuckets = new Set(["property-images", "property-videos"]);

type MediaRouteContext = {
  params: Promise<{
    bucket: string;
    path: string[];
  }>;
};

export async function GET(request: Request, { params }: MediaRouteContext) {
  const { bucket, path } = await params;

  if (!allowedBuckets.has(bucket) || !path.length || path.some((segment) => !segment || segment === "." || segment === "..")) {
    return NextResponse.json({ status: "error", message: "Mídia não encontrada." }, { status: 404 });
  }

  const sourceUrl = getSupabaseStoragePublicUrl(bucket, path.join("/"));
  const response = await fetch(sourceUrl, { cache: "no-store" });

  if (!response.ok || !response.body) {
    return NextResponse.json({ status: "error", message: "Mídia não encontrada." }, { status: 404 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Length": response.headers.get("content-length") ?? "",
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
    },
  });
}
