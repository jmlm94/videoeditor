import { NextRequest, NextResponse } from "next/server";
import { renderQueue } from "@/lib/render/queue";
import { db } from "@/lib/db";
import { videos, briefs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// POST: Trigger render for one or more videos
export async function POST(req: NextRequest) {
  try {
    const { videoId, briefId } = await req.json();

    // Render all approved videos in a brief
    if (briefId) {
      const briefVideos = await db
        .select()
        .from(videos)
        .where(eq(videos.briefId, briefId));

      const approved = briefVideos.filter((v) => v.status === "approved");
      if (approved.length === 0) {
        return NextResponse.json(
          { error: "No approved videos to render" },
          { status: 400 }
        );
      }

      const results = await Promise.all(
        approved.map((v) => renderQueue.add(v.id))
      );

      return NextResponse.json({
        message: `${results.length} videos queued for rendering`,
        items: results,
      });
    }

    // Render single video
    if (videoId) {
      const result = await renderQueue.add(videoId);
      return NextResponse.json({ message: "Render queued", item: result });
    }

    return NextResponse.json(
      { error: "Provide videoId or briefId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Render error:", error);
    return NextResponse.json(
      { error: "Failed to queue render" },
      { status: 500 }
    );
  }
}

// GET: Check render status
export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("videoId");

  if (videoId) {
    const status = renderQueue.getStatus(videoId);
    return NextResponse.json(status || { status: "not_found" });
  }

  return NextResponse.json(renderQueue.getAllStatus());
}
