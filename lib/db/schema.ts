import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "briefing",
  "rendering",
  "review",
  "complete",
]);

export const briefStatusEnum = pgEnum("brief_status", [
  "draft",
  "approved",
  "rejected",
]);

export const videoStatusEnum = pgEnum("video_status", [
  "pending",
  "rendering",
  "rendered",
  "approved",
  "revision",
]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: projectStatusEnum("status").default("draft").notNull(),
  inputType: text("input_type").notNull(), // "concept", "iteration", "trend"
  inputPrompt: text("input_prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const briefs = pgTable("briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  analysisResults: jsonb("analysis_results"),
  status: briefStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const videos = pgTable("videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  briefId: uuid("brief_id")
    .references(() => briefs.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  concept: text("concept"),
  framework: text("framework"), // e.g. "Hook → Problem → Solution → Social Proof → CTA"
  voiceConfig: jsonb("voice_config"), // { voiceId, name, stability, speed, style }
  musicConfig: jsonb("music_config"), // { trackId, mood, energy, ducking }
  subtitleConfig: jsonb("subtitle_config"), // { font, color, position, animation }
  platformTargets: jsonb("platform_targets"), // ["meta", "tiktok", "snapchat", "applovin"]
  totalDurationSeconds: integer("total_duration_seconds"),
  status: videoStatusEnum("status").default("pending").notNull(),
  renderUrl: text("render_url"),
  driveUrl: text("drive_url"),
  renderProgress: integer("render_progress").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scenes = pgTable("scenes", {
  id: uuid("id").defaultRandom().primaryKey(),
  videoId: uuid("video_id")
    .references(() => videos.id, { onDelete: "cascade" })
    .notNull(),
  sceneNumber: integer("scene_number").notNull(),
  durationSeconds: real("duration_seconds").notNull(),
  scriptText: text("script_text").notNull(),
  brollFolder: text("broll_folder"),
  brollClipPath: text("broll_clip_path"),
  overlayText: text("overlay_text"),
  overlayStyle: jsonb("overlay_style"),
  transitionType: text("transition_type").default("cut"),
  effects: jsonb("effects"),
  voiceoverUrl: text("voiceover_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const voices = pgTable("voices", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  elevenlabsVoiceId: text("elevenlabs_voice_id").notNull(),
  gender: text("gender"),
  tone: text("tone"),
  energy: text("energy"),
  accent: text("accent"),
  previewUrl: text("preview_url"),
  notes: text("notes"),
});

export const musicTracks = pgTable("music_tracks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  filePath: text("file_path").notNull(),
  mood: text("mood"),
  energyLevel: integer("energy_level"), // 1-10
  genre: text("genre"),
  bpm: integer("bpm"),
  durationSeconds: real("duration_seconds"),
});

export const learnings = pgTable("learnings", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(), // "youtube", "reddit", "x", "linkedin", "user_feedback"
  content: text("content").notNull(),
  category: text("category"),
  relevanceScore: real("relevance_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brollCatalog = pgTable("broll_catalog", {
  id: uuid("id").defaultRandom().primaryKey(),
  driveFolderId: text("drive_folder_id").notNull(),
  folderName: text("folder_name").notNull(),
  tags: jsonb("tags"),
  clipCount: integer("clip_count").default(0),
  lastIndexed: timestamp("last_indexed"),
});
