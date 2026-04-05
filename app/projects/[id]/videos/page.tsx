import { VideoReview } from "./video-review";

export default async function VideosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <a
          href={`/projects/${id}/brief`}
          className="text-sm text-[var(--muted-foreground)] hover:text-white mb-4 inline-block"
        >
          ← Back to Brief
        </a>
        <h2 className="text-2xl font-bold mb-1">Video Preview & Approval</h2>
        <p className="text-[var(--muted-foreground)]">
          Preview rendered videos, request changes, or approve for delivery
        </p>
      </div>
      <VideoReview projectId={id} />
    </div>
  );
}
