import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { briefs, videos, scenes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [brief] = await db
      .select()
      .from(briefs)
      .where(eq(briefs.id, id));

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    const briefVideos = await db
      .select()
      .from(videos)
      .where(eq(videos.briefId, id));

    const videosWithScenes = await Promise.all(
      briefVideos.map(async (video) => {
        const videoScenes = await db
          .select()
          .from(scenes)
          .where(eq(scenes.videoId, video.id));
        return { ...video, scenes: videoScenes };
      })
    );

    return NextResponse.json({
      ...brief,
      videos: videosWithScenes,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch brief" },
      { status: 500 }
    );
  }
}
