import { z } from "zod";

export const sceneSchema = z.object({
  sceneNumber: z.number(),
  durationSeconds: z.number(),
  scriptText: z.string(),
  brollFolder: z.string(),
  brollClipPath: z.string().optional(),
  overlayText: z.string().optional(),
  overlayStyle: z
    .object({
      fontSize: z.number().optional(),
      position: z.string().optional(),
      animation: z.string().optional(),
    })
    .optional(),
  transitionType: z.string().default("cut"),
  effects: z
    .object({
      zoom: z.boolean().optional(),
      shake: z.boolean().optional(),
      colorGrade: z.string().optional(),
      speedRamp: z.number().optional(),
    })
    .optional(),
  voiceoverUrl: z.string().optional(),
});

export const subtitleConfigSchema = z.object({
  font: z.string().default("Impact"),
  color: z.string().default("#FFFFFF"),
  strokeColor: z.string().default("#000000"),
  position: z.enum(["top", "center", "bottom"]).default("center"),
  animation: z.enum(["none", "fade", "word-by-word", "pop"]).default("word-by-word"),
});

export const adSchema = z.object({
  scenes: z.array(sceneSchema),
  subtitleConfig: subtitleConfigSchema,
  musicUrl: z.string().optional(),
});

export type SceneProps = z.infer<typeof sceneSchema>;
export type SubtitleConfig = z.infer<typeof subtitleConfigSchema>;
export type AdProps = z.infer<typeof adSchema>;
