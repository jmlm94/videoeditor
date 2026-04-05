import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { briefs, videos, scenes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Get most recent brief for this project
    const [brief] = await db
      .select()
      .from(briefs)
      .where(eq(briefs.projectId, projectId))
      .orderBy(desc(briefs.createdAt))
      .limit(1);

    if (!brief) {
      return NextResponse.json({ error: "No brief found" }, { status: 404 });
    }

    const briefVideos = await db
      .select()
      .from(videos)
      .where(eq(videos.briefId, brief.id));

    const videosWithScenes = await Promise.all(
      briefVideos.map(async (video) => {
        const videoScenes = await db
          .select()
          .from(scenes)
          .where(eq(scenes.videoId, video.id));
        videoScenes.sort((a, b) => a.sceneNumber - b.sceneNumber);
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
