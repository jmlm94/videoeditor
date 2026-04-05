import { NextRequest, NextResponse } from "next/server";
import { getRecentTrends, scrapeTrends, saveTrends } from "@/lib/trends/scraper";

// GET: Fetch recent trend learnings
export async function GET(req: NextRequest) {
  try {
    const days = Number(req.nextUrl.searchParams.get("days") || "7");
    const limit = Number(req.nextUrl.searchParams.get("limit") || "20");
    const trends = await getRecentTrends(days, limit);
    return NextResponse.json(trends);
  } catch {
    return NextResponse.json([]);
  }
}

// POST: Trigger trend scraping
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sources = body.sources || ["youtube", "reddit", "x", "linkedin"];

    const trends = await scrapeTrends(sources);
    const count = await saveTrends(trends);

    return NextResponse.json({
      message: `Scraped ${count} trend insights`,
      trends,
    });
  } catch (error) {
    console.error("Trend scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape trends" },
      { status: 500 }
    );
  }
}
