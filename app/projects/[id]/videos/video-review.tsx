"use client";

import { useEffect, useState, useCallback } from "react";
import { VideoCard } from "@/app/components/VideoCard";

interface Scene {
  sceneNumber: number;
  durationSeconds: number;
  scriptText: string;
  brollFolder: string;
  brollClipPath?: string;
  overlayText?: string;
  overlayStyle?: { fontSize?: number; position?: string; animation?: string };
  transitionType: string;
  effects?: Record<string, unknown>;
  voiceoverUrl?: string;
}

interface Video {
  id: string;
  title: string;
  concept: string;
  framework: string;
  totalDurationSeconds: number;
  platformTargets: string[];
  voiceConfig: Record<string, unknown>;
  musicConfig: Record<string, unknown>;
  subtitleConfig: {
    font: string;
    color: string;
    strokeColor: string;
    position: "top" | "center" | "bottom";
    animation: "none" | "fade" | "word-by-word" | "pop";
  };
  status: string;
  scenes: Scene[];
  renderUrl?: string;
  renderProgress?: number;
  driveUrl?: string;
}

interface Brief {
  id: string;
  status: string;
  videos: Video[];
}

export function VideoReview({ projectId }: { projectId: string }) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [renderingIds, setRenderingIds] = useState<Set<string>>(new Set());

  const loadProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) return;
      const project = await res.json();

      // Load brief for this project
      const briefRes = await fetch(`/api/projects/${projectId}/brief`);
      if (briefRes.ok) {
        const briefData = await briefRes.json();
        setBrief(briefData);
      }
    } catch {
      console.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Poll for render progress
  useEffect(() => {
    if (renderingIds.size === 0) return;

    const interval = setInterval(async () => {
      const statuses = await Promise.all(
        Array.from(renderingIds).map(async (videoId) => {
          const res = await fetch(`/api/render?videoId=${videoId}`);
          return res.json();
        })
      );

      let anyComplete = false;
      for (const status of statuses) {
        if (status.status === "complete" || status.status === "failed") {
          anyComplete = true;
          setRenderingIds((prev) => {
            const next = new Set(prev);
            next.delete(status.videoId);
            return next;
          });
        }
      }

      if (anyComplete) {
        loadProject();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [renderingIds, loadProject]);

  async function handleRender(videoId: string) {
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (res.ok) {
        setRenderingIds((prev) => new Set(prev).add(videoId));
        loadProject();
      }
    } catch {
      console.error("Failed to trigger render");
    }
  }

  async function handleRenderAll() {
    if (!brief) return;

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefId: brief.id }),
      });

      if (res.ok) {
        const approved = brief.videos.filter((v) => v.status === "approved");
        setRenderingIds(new Set(approved.map((v) => v.id)));
        loadProject();
      }
    } catch {
      console.error("Failed to trigger batch render");
    }
  }

  async function handleApprove(videoId: string) {
    try {
      await fetch(`/api/videos/${videoId}/approve`, { method: "POST" });
      loadProject();
    } catch {
      console.error("Failed to approve video");
    }
  }

  async function handleUploadToDrive(videoId: string) {
    try {
      const res = await fetch(`/api/videos/${videoId}/upload`, {
        method: "POST",
      });
      if (res.ok) {
        loadProject();
      }
    } catch {
      console.error("Failed to upload to Drive");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--muted-foreground)]">
          Loading videos...
        </div>
      </div>
    );
  }

  if (!brief || brief.videos.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
        <p className="text-[var(--muted-foreground)]">
          No videos found. Generate a brief first.
        </p>
        <a
          href={`/projects/${projectId}/brief`}
          className="inline-block mt-4 px-6 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
        >
          Go to Brief
        </a>
      </div>
    );
  }

  const approvedCount = brief.videos.filter(
    (v) => v.status === "approved"
  ).length;
  const renderedCount = brief.videos.filter(
    (v) => v.status === "rendered"
  ).length;
  const renderingCount = brief.videos.filter(
    (v) => v.status === "rendering"
  ).length;

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="flex gap-6 text-sm">
          <span>
            Total: <strong>{brief.videos.length}</strong>
          </span>
          <span>
            Approved: <strong className="text-[var(--success)]">{approvedCount}</strong>
          </span>
          <span>
            Rendering: <strong className="text-blue-400">{renderingCount}</strong>
          </span>
          <span>
            Rendered: <strong className="text-purple-400">{renderedCount}</strong>
          </span>
        </div>
        <div className="flex gap-2">
          {approvedCount > 0 && (
            <button
              onClick={handleRenderAll}
              className="px-6 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
            >
              Render All Approved ({approvedCount})
            </button>
          )}
          {renderedCount > 0 && (
            <button
              onClick={() => {
                brief.videos
                  .filter((v) => v.status === "rendered")
                  .forEach((v) => handleUploadToDrive(v.id));
              }}
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
            >
              Upload All to Drive ({renderedCount})
            </button>
          )}
        </div>
      </div>

      {/* Video cards */}
      <div className="grid grid-cols-1 gap-6">
        {brief.videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            showPreview={video.status === "rendered"}
            onApprove={() => handleApprove(video.id)}
            onRender={() => handleRender(video.id)}
          />
        ))}
      </div>
    </div>
  );
}
