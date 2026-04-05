import { executeRenderPipeline } from "./pipeline";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface QueueItem {
  videoId: string;
  status: "queued" | "rendering" | "complete" | "failed";
  progress: number;
  stage: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

class RenderQueue {
  private queue: Map<string, QueueItem> = new Map();
  private processing = false;
  private concurrency = 2;
  private activeCount = 0;

  async add(videoId: string) {
    if (this.queue.has(videoId)) {
      return this.queue.get(videoId)!;
    }

    const item: QueueItem = {
      videoId,
      status: "queued",
      progress: 0,
      stage: "Queued",
    };

    this.queue.set(videoId, item);

    await db
      .update(videos)
      .set({ status: "rendering", renderProgress: 0, updatedAt: new Date() })
      .where(eq(videos.id, videoId));

    this.processNext();
    return item;
  }

  private async processNext() {
    if (this.activeCount >= this.concurrency) return;

    const next = Array.from(this.queue.values()).find(
      (item) => item.status === "queued"
    );

    if (!next) return;

    this.activeCount++;
    next.status = "rendering";
    next.startedAt = new Date();

    try {
      await executeRenderPipeline({
        videoId: next.videoId,
        onProgress: (progress, stage) => {
          next.progress = progress;
          next.stage = stage;
        },
      });

      next.status = "complete";
      next.progress = 100;
      next.completedAt = new Date();
    } catch (error) {
      next.status = "failed";
      next.error = error instanceof Error ? error.message : "Unknown error";

      await db
        .update(videos)
        .set({ status: "revision", updatedAt: new Date() })
        .where(eq(videos.id, next.videoId));
    } finally {
      this.activeCount--;
      this.processNext();
    }
  }

  getStatus(videoId: string): QueueItem | undefined {
    return this.queue.get(videoId);
  }

  getAllStatus(): QueueItem[] {
    return Array.from(this.queue.values());
  }

  clear() {
    this.queue.clear();
  }
}

// Singleton
export const renderQueue = new RenderQueue();
