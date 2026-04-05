import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { voices } from "@/lib/db/schema";

export async function GET() {
  try {
    const allVoices = await db.select().from(voices);
    return NextResponse.json(allVoices);
  } catch {
    return NextResponse.json([]);
  }
}
