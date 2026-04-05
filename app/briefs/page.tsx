import { db } from "@/lib/db";
import { briefs, projects, videos } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BriefsPage() {
  let briefList: Array<{
    id: string;
    projectId: string;
    projectName: string;
    status: string;
    videoCount: number;
    createdAt: Date;
  }> = [];

  try {
    const allBriefs = await db
      .select({
        id: briefs.id,
        projectId: briefs.projectId,
        status: briefs.status,
        createdAt: briefs.createdAt,
      })
      .from(briefs)
      .orderBy(desc(briefs.createdAt))
      .limit(20);

    briefList = await Promise.all(
      allBriefs.map(async (brief) => {
        const [project] = await db
          .select({ name: projects.name })
          .from(projects)
          .where(eq(projects.id, brief.projectId));

        const [videoCount] = await db
          .select({ count: count() })
          .from(videos)
          .where(eq(videos.briefId, brief.id));

        return {
          ...brief,
          projectName: project?.name || "Unknown",
          videoCount: videoCount?.count || 0,
        };
      })
    );
  } catch {
    // DB not connected
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Creative Briefs</h2>
        <p className="text-[var(--muted-foreground)]">
          Review and manage generated creative briefs
        </p>
      </div>

      {briefList.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--muted-foreground)]">
            No briefs generated yet. Start a new project to generate your first
            brief.
          </p>
          <Link
            href="/projects/new"
            className="inline-block mt-4 px-6 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
          >
            New Project
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-4">
                  Project
                </th>
                <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-4">
                  Videos
                </th>
                <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-4">
                  Status
                </th>
                <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-4">
                  Created
                </th>
                <th className="text-right text-xs text-[var(--muted-foreground)] font-medium p-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {briefList.map((brief) => (
                <tr
                  key={brief.id}
                  className="border-b border-[var(--card-border)] last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="p-4">
                    <Link
                      href={`/projects/${brief.projectId}/brief`}
                      className="font-medium hover:text-[var(--primary)] transition-colors"
                    >
                      {brief.projectName}
                    </Link>
                  </td>
                  <td className="p-4 text-sm">{brief.videoCount} videos</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        brief.status === "approved"
                          ? "text-green-400 bg-green-400/10"
                          : brief.status === "rejected"
                            ? "text-red-400 bg-red-400/10"
                            : "text-yellow-400 bg-yellow-400/10"
                      }`}
                    >
                      {brief.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[var(--muted-foreground)]">
                    {new Date(brief.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/projects/${brief.projectId}/brief`}
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
