"use client";

import { useState } from "react";
import { VideoPreview } from "./VideoPreview";

interface Scene {
  sceneNumber: number;
  durationSeconds: number;
  scriptText: string;
  brollFolder: string;
  brollClipPath?: string;
  overlayText?: string;
  overlayStyle?: { fontSize?: number; position?: string; animation?: string };
  transitionType: string;
  effects?: { zoom?: boolean; shake?: boolean; colorGrade?: string; speedRamp?: number };
  voiceoverUrl?: string;
}

interface VideoData {
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
}

interface VideoCardProps {
  video: VideoData;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestChanges?: () => void;
  onRender?: () => void;
  showPreview?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  approved: "text-green-400 bg-green-400/10",
  rendering: "text-blue-400 bg-blue-400/10 animate-pulse",
  rendered: "text-purple-400 bg-purple-400/10",
  revision: "text-orange-400 bg-orange-400/10",
};

export function VideoCard({
  video,
  onApprove,
  onReject,
  onRequestChanges,
  onRender,
  showPreview = false,
}: VideoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(showPreview);

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold text-lg">{video.title}</h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[video.status] || ""}`}
              >
                {video.status}
              </span>
              <span className="text-xs text-[var(--muted)]">
                {video.totalDurationSeconds}s
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              {video.concept}
            </p>
            <p className="text-xs text-[var(--muted)]">
              Framework: {video.framework}
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

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setPreviewVisible(!previewVisible)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors"
            >
              {previewVisible ? "Hide Preview" : "Preview"}
            </button>
            {video.status === "pending" && onApprove && (
              <button
                onClick={onApprove}
                className="px-4 py-1.5 rounded-lg bg-[var(--success)] hover:bg-[var(--success)]/80 text-white text-sm font-medium transition-colors"
              >
                Approve
              </button>
            )}
            {video.status === "pending" && onReject && (
              <button
                onClick={onReject}
                className="px-4 py-1.5 rounded-lg bg-[var(--destructive)]/20 hover:bg-[var(--destructive)]/30 text-[var(--destructive)] text-sm transition-colors"
              >
                Reject
              </button>
            )}
            {video.status === "approved" && onRender && (
              <button
                onClick={onRender}
                className="px-4 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
              >
                Render
              </button>
            )}
            {video.status === "rendered" && video.renderUrl && (
              <a
                href={video.renderUrl}
                download
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
              >
                Download
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      {previewVisible && video.scenes && video.scenes.length > 0 && (
        <div className="px-6 pb-4">
          <div className="max-w-[280px] mx-auto">
            <VideoPreview
              scenes={video.scenes}
              subtitleConfig={
                video.subtitleConfig || {
                  font: "Impact",
                  color: "#FFFFFF",
                  strokeColor: "#000000",
                  position: "center" as const,
                  animation: "word-by-word" as const,
                }
              }
            />
          </div>
        </div>
      )}

      {/* Expand/collapse scene details */}
      <div
        className="px-6 py-3 border-t border-[var(--card-border)] cursor-pointer hover:bg-white/[0.02] transition-colors flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm text-[var(--muted-foreground)]">
          {video.scenes?.length || 0} scenes · {video.totalDurationSeconds}s total
        </span>
        <span className="text-[var(--muted)] text-xs">
          {expanded ? "▲ Hide Details" : "▼ Show Details"}
        </span>
      </div>

      {/* Scene breakdown */}
      {expanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* Config blocks */}
          <div className="grid grid-cols-3 gap-3">
            <ConfigBlock title="Voice" config={video.voiceConfig} />
            <ConfigBlock title="Music" config={video.musicConfig} />
            <ConfigBlock
              title="Subtitles"
              config={video.subtitleConfig as unknown as Record<string, unknown>}
            />
          </div>

          {/* Scenes */}
          <div className="space-y-2">
            {video.scenes?.map((scene) => (
              <div
                key={scene.sceneNumber}
                className="flex gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center text-xs font-bold">
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
                  <p className="text-sm leading-relaxed">{scene.scriptText}</p>
                  {scene.overlayText && (
                    <p className="text-xs text-[var(--primary)] mt-1">
                      Overlay: {scene.overlayText}
                    </p>
                  )}
                  {scene.effects && Object.keys(scene.effects).length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {Object.entries(scene.effects).map(([key, val]) =>
                        val ? (
                          <span
                            key={key}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400"
                          >
                            {key}: {String(val)}
                          </span>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
      <h6 className="text-[10px] font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">
        {title}
      </h6>
      <div className="space-y-0.5">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex justify-between text-xs">
            <span className="text-[var(--muted)]">{key}</span>
            <span className="truncate ml-2">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
