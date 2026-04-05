"use client";

import { useEffect, useState } from "react";

interface Scene {
  sceneNumber: number;
  durationSeconds: number;
  scriptText: string;
  brollFolder: string;
  overlayText?: string;
  transitionType: string;
  effects?: Record<string, unknown>;
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
  subtitleConfig: Record<string, unknown>;
  status: string;
  scenes: Scene[];
}

interface Brief {
  id: string;
  analysisResults: { analysis?: string } | null;
  status: string;
  videos: Video[];
}

export function BriefReview({ projectId }: { projectId: string }) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    loadBrief();
  }, [projectId]);

  async function loadBrief() {
    try {
      // Try to load existing brief for this project
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Project not found");

      const project = await res.json();

      // Check if brief already exists
      // For now, show generate button if no brief
      setLoading(false);
    } catch {
      setError("Failed to load project");
      setLoading(false);
    }
  }

  async function generateBrief() {
    setGenerating(true);
    setError(null);
    try {
      const projectRes = await fetch(`/api/projects/${projectId}`);
      const project = await projectRes.json();

      const res = await fetch("/api/briefs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          inputPrompt: project.inputPrompt,
          inputType: project.inputType,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate brief");

      const { briefId } = await res.json();

      // Load the generated brief
      const briefRes = await fetch(`/api/briefs/${briefId}`);
      const briefData = await briefRes.json();
      setBrief(briefData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate brief");
    } finally {
      setGenerating(false);
    }
  }

  async function approveVideo(videoId: string) {
    // TODO: Update video status via API
    if (brief) {
      setBrief({
        ...brief,
        videos: brief.videos.map((v) =>
          v.id === videoId ? { ...v, status: "approved" } : v
        ),
      });
    }
  }

  async function approveAll() {
    if (brief) {
      setBrief({
        ...brief,
        videos: brief.videos.map((v) => ({ ...v, status: "approved" })),
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[var(--muted-foreground)]">
          Loading...
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 text-[var(--destructive)]">
            {error}
          </div>
        )}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--muted-foreground)] mb-4">
            Ready to generate a creative brief with up to 8 unique video ad
            concepts.
          </p>
          <button
            onClick={generateBrief}
            disabled={generating}
            className="px-8 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white font-medium transition-colors"
          >
            {generating
              ? "Generating with Claude AI..."
              : "Generate Creative Brief"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis */}
      {brief.analysisResults && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="font-semibold mb-2 text-[var(--primary)]">
            Creative Analysis
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            {typeof brief.analysisResults === "object" && "analysis" in brief.analysisResults
              ? (brief.analysisResults as { analysis: string }).analysis
              : JSON.stringify(brief.analysisResults)}
          </p>
        </div>
      )}

      {/* Approve All */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          {brief.videos.length} video concepts generated
        </p>
        <button
          onClick={approveAll}
          className="px-6 py-2 rounded-lg bg-[var(--success)] hover:bg-[var(--success)]/80 text-white text-sm font-medium transition-colors"
        >
          Approve All & Render
        </button>
      </div>

      {/* Video Cards */}
      <div className="grid grid-cols-1 gap-6">
        {brief.videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isExpanded={selectedVideo === video.id}
            onToggle={() =>
              setSelectedVideo(selectedVideo === video.id ? null : video.id)
            }
            onApprove={() => approveVideo(video.id)}
          />
        ))}
      </div>
    </div>
  );
}

function VideoCard({
  video,
  isExpanded,
  onToggle,
  onApprove,
}: {
  video: Video;
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
}) {
  const statusColors: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10",
    approved: "text-green-400 bg-green-400/10",
    rendering: "text-blue-400 bg-blue-400/10",
    rendered: "text-purple-400 bg-purple-400/10",
    revision: "text-orange-400 bg-orange-400/10",
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-lg">{video.title}</h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${statusColors[video.status] || ""}`}
              >
                {video.status}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {video.totalDurationSeconds}s
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {video.concept}
            </p>
            <div className="flex gap-2 mt-2">
              {video.platformTargets?.map((platform: string) => (
                <span
                  key={platform}
                  className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {video.status === "pending" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove();
                }}
                className="px-4 py-1.5 rounded-lg bg-[var(--success)] hover:bg-[var(--success)]/80 text-white text-sm font-medium transition-colors"
              >
                Approve
              </button>
            )}
            <span className="text-[var(--muted)]">{isExpanded ? "▲" : "▼"}</span>
          </div>
        </div>
        <p className="text-xs text-[var(--muted)] mt-2">
          Framework: {video.framework}
        </p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-[var(--card-border)] p-6 space-y-4">
          {/* Voice & Music Config */}
          <div className="grid grid-cols-2 gap-4">
            <ConfigBlock title="Voice" config={video.voiceConfig} />
            <ConfigBlock title="Music" config={video.musicConfig} />
          </div>

          {/* Scene Breakdown */}
          <div>
            <h5 className="font-medium mb-3">
              Scene Breakdown ({video.scenes?.length || 0} scenes)
            </h5>
            <div className="space-y-3">
              {video.scenes?.map((scene) => (
                <div
                  key={scene.sceneNumber}
                  className="flex gap-4 p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)]"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center text-sm font-bold">
                    {scene.sceneNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--muted)]">
                        {scene.durationSeconds}s
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]">
                        {scene.brollFolder}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {scene.transitionType}
                      </span>
                    </div>
                    <p className="text-sm">{scene.scriptText}</p>
                    {scene.overlayText && (
                      <p className="text-xs text-[var(--primary)] mt-1">
                        Overlay: {scene.overlayText}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigBlock({
  title,
  config,
}: {
  title: string;
  config: Record<string, unknown>;
}) {
  if (!config) return null;
  return (
    <div className="p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
      <h6 className="text-xs font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">
        {title}
      </h6>
      <div className="space-y-1">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex justify-between text-xs">
            <span className="text-[var(--muted)]">{key}</span>
            <span>{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
