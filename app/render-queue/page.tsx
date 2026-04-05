export default function RenderQueuePage() {
  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Render Queue</h2>
        <p className="text-[var(--muted-foreground)]">
          Track the progress of your video renders
        </p>
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
        <p className="text-[var(--muted-foreground)]">
          No videos in the render queue. Approve a brief to start rendering.
        </p>
      </div>
    </div>
  );
}
