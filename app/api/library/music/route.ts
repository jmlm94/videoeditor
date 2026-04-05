import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { musicTracks } from "@/lib/db/schema";

export async function GET() {
  try {
    const tracks = await db.select().from(musicTracks);
    return NextResponse.json(tracks);
  } catch {
    return NextResponse.json([]);
  }
}
