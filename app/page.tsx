import { db } from "@/lib/db";
import { projects, videos, learnings } from "@/lib/db/schema";
import { desc, eq, count, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let projectList: Array<{
    id: string;
    name: string;
    status: string;
    inputType: string;
    createdAt: Date;
  }> = [];
  let stats = { activeProjects: 0, renderedVideos: 0, pendingRenders: 0, trendAlerts: 0 };

  try {
    projectList = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(10);

    const [activeCount] = await db
      .select({ count: count() })
      .from(projects)
      .where(
        sql`${projects.status} IN ('draft', 'briefing', 'rendering', 'review')`
      );

    const [renderedCount] = await db
      .select({ count: count() })
      .from(videos)
      .where(eq(videos.status, "rendered"));

    const [pendingCount] = await db
      .select({ count: count() })
      .from(videos)
      .where(eq(videos.status, "rendering"));

    const [trendCount] = await db
      .select({ count: count() })
      .from(learnings)
      .where(
        sql`${learnings.createdAt} > NOW() - INTERVAL '7 days'`
      );

    stats = {
      activeProjects: activeCount?.count || 0,
      renderedVideos: renderedCount?.count || 0,
      pendingRenders: pendingCount?.count || 0,
      trendAlerts: trendCount?.count || 0,
    };
  } catch {
    // DB not connected yet — show empty state
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
        <p className="text-[var(--muted-foreground)]">
          Create and manage AI-powered video ads for Carbinox
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Projects" value={String(stats.activeProjects)} />
        <StatCard label="Videos Rendered" value={String(stats.renderedVideos)} />
        <StatCard label="Pending Renders" value={String(stats.pendingRenders)} />
        <StatCard label="Trend Alerts (7d)" value={String(stats.trendAlerts)} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <ActionCard
          href="/projects/new"
          title="New Concept"
          description="Start from a fresh idea or creative direction"
        />
        <ActionCard
          href="/projects/new?type=iteration"
          title="Iterate on Winners"
          description="Create variations of your top performing ads"
        />
        <ActionCard
          href="/projects/new?type=trend"
          title="Trend-Based"
          description="Generate ads based on current DTC trends"
        />
      </div>

      {/* Recent Projects */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
        {projectList.length === 0 ? (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
            <p className="text-[var(--muted-foreground)]">
              No projects yet. Create your first project to get started.
            </p>
            <Link
              href="/projects/new"
              className="inline-block mt-4 px-6 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-4">
                    Name
                  </th>
                  <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-4">
                    Type
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
                {projectList.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-[var(--card-border)] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="p-4">
                      <Link
                        href={`/projects/${project.id}/brief`}
                        className="font-medium hover:text-[var(--primary)] transition-colors"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]">
                        {project.inputType}
                      </span>
                    </td>
                    <td className="p-4">
                      <ProjectStatus status={project.status} />
                    </td>
                    <td className="p-4 text-sm text-[var(--muted-foreground)]">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/projects/${project.id}/brief`}
                        className="text-sm text-[var(--primary)] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-[var(--muted-foreground)] mt-1">{label}</p>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 hover:border-[var(--primary)]/50 transition-colors group block"
    >
      <h4 className="font-semibold mb-1 group-hover:text-[var(--primary)] transition-colors">
        {title}
      </h4>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
    </Link>
  );
}

function ProjectStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "text-gray-400 bg-gray-400/10",
    briefing: "text-blue-400 bg-blue-400/10",
    rendering: "text-yellow-400 bg-yellow-400/10 animate-pulse",
    review: "text-purple-400 bg-purple-400/10",
    complete: "text-green-400 bg-green-400/10",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || "text-gray-400 bg-gray-400/10"}`}
    >
      {status}
    </span>
  );
}
