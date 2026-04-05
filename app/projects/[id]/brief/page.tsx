import { BriefReview } from "./brief-review";

export default async function BriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <a
          href="/"
          className="text-sm text-[var(--muted-foreground)] hover:text-white mb-4 inline-block"
        >
          ← Back to Dashboard
        </a>
        <h2 className="text-2xl font-bold mb-1">Creative Brief Review</h2>
        <p className="text-[var(--muted-foreground)]">
          Review, edit, and approve generated video concepts
        </p>
      </div>
      <BriefReview projectId={id} />
    </div>
  );
}
