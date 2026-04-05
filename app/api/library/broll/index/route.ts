import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brollCatalog } from "@/lib/db/schema";
import { indexBrollFolders } from "@/lib/integrations/google-drive";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const brollFolderId = process.env.GOOGLE_DRIVE_BROLL_FOLDER_ID;
    if (!brollFolderId) {
      return NextResponse.json(
        { error: "B-Roll folder not configured" },
        { status: 400 }
      );
    }

    const catalog = await indexBrollFolders(brollFolderId);

    for (const folder of catalog) {
      const existing = await db
        .select()
        .from(brollCatalog)
        .where(eq(brollCatalog.driveFolderId, folder.driveFolderId));

      if (existing.length > 0) {
        await db
          .update(brollCatalog)
          .set({
            clipCount: folder.clipCount,
            lastIndexed: new Date(),
          })
          .where(eq(brollCatalog.driveFolderId, folder.driveFolderId));
      } else {
        await db.insert(brollCatalog).values({
          driveFolderId: folder.driveFolderId,
          folderName: folder.folderName,
          clipCount: folder.clipCount,
          tags: [],
          lastIndexed: new Date(),
        });
      }
    }

    return NextResponse.json({ indexed: catalog.length });
  } catch (error) {
    console.error("Index error:", error);
    return NextResponse.json(
      { error: "Failed to index b-roll" },
      { status: 500 }
    );
  }
}
