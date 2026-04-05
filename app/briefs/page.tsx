export default function BriefsPage() {
  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Creative Briefs</h2>
        <p className="text-[var(--muted-foreground)]">
          Review and manage generated creative briefs
        </p>
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
        <p className="text-[var(--muted-foreground)]">
          No briefs generated yet. Start a new project to generate your first brief.
        </p>
      </div>
    </div>
  );
}
