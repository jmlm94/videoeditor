import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { voices } from "@/lib/db/schema";
import { listVoices } from "@/lib/integrations/elevenlabs";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const elevenlabsVoices = await listVoices();

    for (const v of elevenlabsVoices) {
      const existing = await db
        .select()
        .from(voices)
        .where(eq(voices.elevenlabsVoiceId, v.voice_id));

      if (existing.length === 0) {
        await db.insert(voices).values({
          name: v.name,
          elevenlabsVoiceId: v.voice_id,
          gender: v.labels?.gender || null,
          tone: v.labels?.use_case || null,
          energy: null,
          accent: v.labels?.accent || null,
        });
      }
    }

    return NextResponse.json({ synced: elevenlabsVoices.length });
  } catch (error) {
    console.error("Voice sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync voices" },
      { status: 500 }
    );
  }
}
