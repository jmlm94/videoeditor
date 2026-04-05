"use client";

import { useEffect, useState, useCallback } from "react";

interface RenderItem {
  videoId: string;
  status: "queued" | "rendering" | "complete" | "failed";
  progress: number;
  stage: string;
  error?: string;
}

interface Video {
  id: string;
  title: string;
  status: string;
  renderProgress: number;
  totalDurationSeconds: number;
}

export default function RenderQueuePage() {
  const [queueItems, setQueueItems] = useState<RenderItem[]>([]);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [queueRes, videosRes] = await Promise.all([
        fetch("/api/render"),
        fetch("/api/videos?status=rendering,rendered"),
      ]);

      if (queueRes.ok) {
        const items = await queueRes.json();
        setQueueItems(Array.isArray(items) ? items : []);
      }

      if (videosRes.ok) {
        const vids = await videosRes.json();
        setRecentVideos(Array.isArray(vids) ? vids : []);
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const hasActiveRenders = queueItems.some(
    (item) => item.status === "queued" || item.status === "rendering"
  );

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Render Queue</h2>
        <p className="text-[var(--muted-foreground)]">
          Track the progress of your video renders
        </p>
        {hasActiveRenders && (
          <p className="text-xs text-blue-400 mt-1 animate-pulse">
            Renders in progress — auto-refreshing every 5s
          </p>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse text-[var(--muted-foreground)] py-20 text-center">
          Loading...
        </div>
      ) : queueItems.length === 0 && recentVideos.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--muted-foreground)]">
            No videos in the render queue. Approve a brief to start rendering.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queueItems.map((item) => (
            <RenderItemCard key={item.videoId} item={item} />
          ))}
          {recentVideos
            .filter(
              (v) => !queueItems.find((q) => q.videoId === v.id)
            )
            .map((video) => (
              <div
                key={video.id}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{video.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {video.totalDurationSeconds}s · {video.status}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    video.status === "rendered"
                      ? "text-green-400 bg-green-400/10"
                      : "text-yellow-400 bg-yellow-400/10"
                  }`}
                >
                  {video.status}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function RenderItemCard({ item }: { item: RenderItem }) {
  const statusColors: Record<string, string> = {
    queued: "border-gray-500/30",
    rendering: "border-blue-500/30",
    complete: "border-green-500/30",
    failed: "border-red-500/30",
  };

  return (
    <div
      className={`rounded-xl border bg-[var(--card)] p-4 ${statusColors[item.status] || "border-[var(--card-border)]"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-sm">{item.videoId.slice(0, 8)}...</p>
          <p className="text-xs text-[var(--muted-foreground)]">{item.stage}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            item.status === "rendering"
              ? "text-blue-400 bg-blue-400/10 animate-pulse"
              : item.status === "complete"
                ? "text-green-400 bg-green-400/10"
                : item.status === "failed"
                  ? "text-red-400 bg-red-400/10"
                  : "text-gray-400 bg-gray-400/10"
          }`}
        >
          {item.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            item.status === "failed"
              ? "bg-red-500"
              : item.status === "complete"
                ? "bg-green-500"
                : "bg-blue-500"
          }`}
          style={{ width: `${item.progress}%` }}
        />
      </div>
      <p className="text-xs text-[var(--muted)] mt-1">{item.progress}%</p>

      {item.error && (
        <p className="text-xs text-red-400 mt-2">{item.error}</p>
      )}
    </div>
  );
}
