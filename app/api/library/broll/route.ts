import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brollCatalog } from "@/lib/db/schema";

export async function GET() {
  try {
    const folders = await db.select().from(brollCatalog);
    return NextResponse.json(folders);
  } catch {
    return NextResponse.json([]);
  }
}
