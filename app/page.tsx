export default function Dashboard() {
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
        <StatCard label="Active Projects" value="0" />
        <StatCard label="Videos Rendered" value="0" />
        <StatCard label="Pending Renders" value="0" />
        <StatCard label="Trend Alerts" value="0" />
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
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--muted-foreground)]">
            No projects yet. Create your first project to get started.
          </p>
          <a
            href="/projects/new"
            className="inline-block mt-4 px-6 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
          >
            Create Project
          </a>
        </div>
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
    <a
      href={href}
      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 hover:border-[var(--primary)]/50 transition-colors group"
    >
      <h4 className="font-semibold mb-1 group-hover:text-[var(--primary)] transition-colors">
        {title}
      </h4>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
    </a>
  );
}
