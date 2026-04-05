import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Missing videoId" },
        { status: 400 }
      );
    }

    // Update video status to rendering
    await db
      .update(videos)
      .set({ status: "rendering", renderProgress: 0, updatedAt: new Date() })
      .where(eq(videos.id, videoId));

    // TODO: Trigger actual Remotion render (Lambda or local)
    // For now, we just mark it as rendering
    // In production, this would call Remotion Lambda or a render server

    return NextResponse.json({
      message: "Render triggered",
      videoId,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to trigger render" },
      { status: 500 }
    );
  }
}
