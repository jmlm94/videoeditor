import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");

    let query = db.select().from(videos).orderBy(desc(videos.updatedAt));

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      query = query.where(
        sql`${videos.status} IN (${sql.join(
          statuses.map((s) => sql`${s}`),
          sql`, `
        )})`
      ) as typeof query;
    }

    const result = await query.limit(50);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
