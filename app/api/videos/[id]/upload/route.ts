import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uploadFile } from "@/lib/integrations/google-drive";
import { readFile } from "fs/promises";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id));

    if (!video || !video.renderUrl) {
      return NextResponse.json(
        { error: "Video not found or not rendered" },
        { status: 404 }
      );
    }

    // Read the rendered file
    const buffer = await readFile(video.renderUrl);

    // Upload to Google Drive output folder
    const outputFolderId = process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID;
    if (!outputFolderId) {
      return NextResponse.json(
        { error: "Output folder not configured" },
        { status: 500 }
      );
    }

    const fileName = `${video.title.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.mp4`;
    const driveFile = await uploadFile(
      outputFolderId,
      fileName,
      "video/mp4",
      buffer
    );

    // Update video with Drive URL
    await db
      .update(videos)
      .set({
        driveUrl: driveFile.webViewLink || undefined,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, id));

    return NextResponse.json({
      success: true,
      driveUrl: driveFile.webViewLink,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload to Drive" },
      { status: 500 }
    );
  }
}
