import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { learnings } from "@/lib/db/schema";

const TREND_SOURCES = ["youtube", "reddit", "x", "linkedin"] as const;
type TrendSource = (typeof TREND_SOURCES)[number];

interface TrendResult {
  source: TrendSource;
  content: string;
  category: string;
  relevanceScore: number;
}

const SCRAPE_PROMPTS: Record<TrendSource, string> = {
  youtube: `Analyze current YouTube advertising trends relevant to DTC ecommerce brands, particularly rugged/outdoor product brands. Focus on:
- Top-performing ad formats (UGC, talking head, product demo, lifestyle)
- Hook styles that drive high CTR
- Video length trends for paid ads
- Music and editing style trends
- Subtitle and text overlay patterns
Provide 3-5 specific, actionable insights.`,

  reddit: `Analyze current Reddit discussions about DTC ecommerce advertising, smartwatch marketing, and video ad creative. Focus on:
- What consumers respond to positively in product ads
- Common complaints about watch/tech advertising
- Authenticity signals that build trust
- Ad formats users engage with vs skip
Provide 3-5 specific, actionable insights.`,

  x: `Analyze current X/Twitter trends relevant to DTC ecommerce video advertising. Focus on:
- Viral ad formats gaining traction
- Short-form video trends for product marketing
- Creator/UGC trends applicable to product ads
- Hook patterns driving engagement
Provide 3-5 specific, actionable insights.`,

  linkedin: `Analyze current LinkedIn discussions about DTC brand marketing and video advertising strategy. Focus on:
- B2B-informed DTC ad strategies
- CEO/founder-led content trends
- Brand storytelling approaches
- Performance marketing creative trends
Provide 3-5 specific, actionable insights.`,
};

export async function scrapeTrends(
  sources: TrendSource[] = [...TREND_SOURCES]
): Promise<TrendResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const client = new Anthropic({ apiKey });
  const results: TrendResult[] = [];

  for (const source of sources) {
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: `You are a DTC advertising trend analyst. You have deep knowledge of current digital advertising trends across social platforms.

Your analysis should be specific to DTC ecommerce brands selling physical products (especially rugged/outdoor consumer electronics like smartwatches).

Return your response as a JSON array of objects with this structure:
[
  {
    "content": "Specific trend insight with actionable details",
    "category": "one of: hook_styles, ad_formats, editing_techniques, music_trends, audience_targeting, creative_strategy, platform_specific",
    "relevanceScore": 0.0 to 1.0
  }
]`,
        messages: [
          {
            role: "user",
            content: SCRAPE_PROMPTS[source],
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (!textBlock || textBlock.type !== "text") continue;

      let jsonStr = textBlock.text;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1];

      const parsed = JSON.parse(jsonStr.trim()) as Array<{
        content: string;
        category: string;
        relevanceScore: number;
      }>;

      for (const item of parsed) {
        results.push({
          source,
          content: item.content,
          category: item.category,
          relevanceScore: item.relevanceScore,
        });
      }
    } catch (error) {
      console.error(`Failed to scrape trends from ${source}:`, error);
    }
  }

  return results;
}

export async function saveTrends(trends: TrendResult[]) {
  for (const trend of trends) {
    await db.insert(learnings).values({
      source: trend.source,
      content: trend.content,
      category: trend.category,
      relevanceScore: trend.relevanceScore,
    });
  }

  return trends.length;
}

export async function getRecentTrends(days = 7, limit = 20) {
  const { sql, desc } = await import("drizzle-orm");

  const results = await db
    .select()
    .from(learnings)
    .where(
      sql`${learnings.createdAt} > NOW() - INTERVAL '${sql.raw(String(days))} days'`
    )
    .orderBy(desc(learnings.relevanceScore))
    .limit(limit);

  return results;
}
