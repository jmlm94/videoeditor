import Anthropic from "@anthropic-ai/sdk";
import { CARBINOX_BRAND_CONTEXT, BRIEF_GENERATION_PROMPT } from "./brand-context";

interface BriefGenerationInput {
  inputPrompt: string;
  inputType: string;
  winningAdsContext?: string;
  trendContext?: string;
}

interface GeneratedScene {
  sceneNumber: number;
  durationSeconds: number;
  scriptText: string;
  brollFolder: string;
  brollClipPath?: string;
  overlayText?: string;
  overlayStyle?: Record<string, unknown>;
  transitionType: string;
  effects?: Record<string, unknown>;
}

interface GeneratedVideo {
  title: string;
  concept: string;
  framework: string;
  totalDurationSeconds: number;
  platformTargets: string[];
  voiceConfig: Record<string, unknown>;
  musicConfig: Record<string, unknown>;
  subtitleConfig: Record<string, unknown>;
  scenes: GeneratedScene[];
}

interface GeneratedBrief {
  analysis: string;
  videos: GeneratedVideo[];
}

export async function generateCreativeBrief(
  input: BriefGenerationInput
): Promise<GeneratedBrief> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Return mock data when no API key is configured
    return generateMockBrief(input);
  }

  const client = new Anthropic({ apiKey });

  let userMessage = `Creative Direction: ${input.inputPrompt}\nInput Type: ${input.inputType}`;

  if (input.winningAdsContext) {
    userMessage += `\n\nWinning Ads Analysis:\n${input.winningAdsContext}`;
  }

  if (input.trendContext) {
    userMessage += `\n\nCurrent Trends:\n${input.trendContext}`;
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system: `${CARBINOX_BRAND_CONTEXT}\n\n${BRIEF_GENERATION_PROMPT}`,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = textBlock.text;
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const parsed = JSON.parse(jsonStr.trim()) as GeneratedBrief;
  return parsed;
}

function generateMockBrief(input: BriefGenerationInput): GeneratedBrief {
  return {
    analysis: `Analysis of "${input.inputPrompt}": This concept aligns well with Carbinox's expanding audience strategy. Recommended approach: mix of CEO direct-to-camera authority hooks with lifestyle/action b-roll showcasing the watch in demanding environments. Lifetime warranty should be the conversion anchor across all variants.`,
    videos: [
      {
        title: "CEO Straight Talk — Lifetime Promise",
        concept:
          "CEO speaks directly to camera about why Carbinox offers a lifetime warranty when no one else does. Raw, confident, no-nonsense.",
        framework: "CEO Direct-to-Camera → Story → Product → Warranty → CTA",
        totalDurationSeconds: 30,
        platformTargets: ["meta", "tiktok"],
        voiceConfig: {
          voiceName: "Confident Male",
          pace: "medium",
          energy: "high",
          tone: "authoritative",
        },
        musicConfig: {
          mood: "epic",
          energy: 7,
          genre: "cinematic",
          notes: "Subtle build, peaks at warranty reveal",
        },
        subtitleConfig: {
          font: "Impact",
          color: "#FFFFFF",
          strokeColor: "#000000",
          position: "center",
          animation: "word-by-word",
        },
        scenes: [
          {
            sceneNumber: 1,
            durationSeconds: 3,
            scriptText: "I'm the CEO of Carbinox, and I'm about to tell you something no other watch company will.",
            brollFolder: "ceo-shots",
            overlayText: "CEO of Carbinox",
            overlayStyle: { fontSize: 32, position: "bottom" },
            transitionType: "cut",
            effects: { zoom: false, colorGrade: "warm" },
          },
          {
            sceneNumber: 2,
            durationSeconds: 5,
            scriptText: "We put a lifetime warranty on every single watch we sell. Not one year. Not two. Lifetime.",
            brollFolder: "watch-closeups",
            transitionType: "cut",
            effects: { zoom: true, colorGrade: "warm" },
          },
          {
            sceneNumber: 3,
            durationSeconds: 5,
            scriptText: "Because we build watches for people who actually use them. Construction sites. Mountain trails. The gym at 5 AM.",
            brollFolder: "outdoor-rugged",
            transitionType: "cut",
            effects: { colorGrade: "cinematic" },
          },
          {
            sceneNumber: 4,
            durationSeconds: 5,
            scriptText: "The Blaze. Tracks your health, survives anything, and looks good doing it.",
            brollFolder: "watch-closeups",
            overlayText: "BLAZE — $139.95",
            overlayStyle: { fontSize: 48, position: "center", animation: "pop" },
            transitionType: "dissolve",
            effects: { zoom: true, colorGrade: "warm" },
          },
          {
            sceneNumber: 5,
            durationSeconds: 7,
            scriptText: "Over 200,000 people already made the switch. Lifetime warranty included.",
            brollFolder: "testimonials",
            transitionType: "cut",
            effects: { colorGrade: "warm" },
          },
          {
            sceneNumber: 6,
            durationSeconds: 5,
            scriptText: "Get yours today. Link below.",
            brollFolder: "offer-screens",
            overlayText: "SHOP NOW — FREE SHIPPING",
            overlayStyle: { fontSize: 56, position: "center", animation: "pop" },
            transitionType: "cut",
            effects: { colorGrade: "warm" },
          },
        ],
      },
      {
        title: "The Watch That Won't Quit",
        concept:
          "Fast-paced montage of the watch surviving extreme conditions, intercut with real customer reactions. Pattern interrupt hook.",
        framework: "Hook → Durability Proof → Features → Social Proof → CTA",
        totalDurationSeconds: 15,
        platformTargets: ["tiktok", "snapchat"],
        voiceConfig: {
          voiceName: "Energetic Male",
          pace: "fast",
          energy: "very-high",
          tone: "excited",
        },
        musicConfig: {
          mood: "intense",
          energy: 9,
          genre: "electronic",
          notes: "High energy from start, bass drop at product reveal",
        },
        subtitleConfig: {
          font: "Impact",
          color: "#FF6600",
          strokeColor: "#000000",
          position: "center",
          animation: "word-by-word",
        },
        scenes: [
          {
            sceneNumber: 1,
            durationSeconds: 2,
            scriptText: "Watch this.",
            brollFolder: "durability-tests",
            overlayText: "WATCH THIS 👀",
            overlayStyle: { fontSize: 64, position: "center", animation: "shake" },
            transitionType: "cut",
            effects: { shake: true },
          },
          {
            sceneNumber: 2,
            durationSeconds: 4,
            scriptText: "Dropped it. Dunked it. Dragged it through concrete.",
            brollFolder: "durability-tests",
            transitionType: "cut",
            effects: { zoom: true, colorGrade: "high-contrast" },
          },
          {
            sceneNumber: 3,
            durationSeconds: 3,
            scriptText: "Still ticking. Still tracking. Lifetime warranty.",
            brollFolder: "watch-closeups",
            overlayText: "LIFETIME WARRANTY",
            overlayStyle: { fontSize: 48, position: "center", animation: "pop" },
            transitionType: "dissolve",
            effects: { colorGrade: "warm" },
          },
          {
            sceneNumber: 4,
            durationSeconds: 3,
            scriptText: "Carbinox Blaze. Starting at one thirty-nine ninety-five.",
            brollFolder: "lifestyle",
            transitionType: "cut",
            effects: { colorGrade: "warm" },
          },
          {
            sceneNumber: 5,
            durationSeconds: 3,
            scriptText: "Link in bio.",
            brollFolder: "offer-screens",
            overlayText: "SHOP NOW",
            overlayStyle: { fontSize: 56, position: "center", animation: "pop" },
            transitionType: "cut",
            effects: {},
          },
        ],
      },
      {
        title: "Why 200K People Switched",
        concept:
          "Social proof driven ad that leads with the community size, then backs it up with product quality and warranty.",
        framework: "Social Proof Hook → Problem → Solution → Features → CTA",
        totalDurationSeconds: 30,
        platformTargets: ["meta", "applovin"],
        voiceConfig: {
          voiceName: "Casual Male",
          pace: "medium",
          energy: "medium",
          tone: "conversational",
        },
        musicConfig: {
          mood: "inspirational",
          energy: 6,
          genre: "indie",
          notes: "Warm, builds slowly, feel-good energy",
        },
        subtitleConfig: {
          font: "Helvetica",
          color: "#FFFFFF",
          strokeColor: "#000000",
          position: "bottom",
          animation: "fade",
        },
        scenes: [
          {
            sceneNumber: 1,
            durationSeconds: 3,
            scriptText: "Over 200,000 people ditched their old smartwatch for this.",
            brollFolder: "testimonials",
            overlayText: "200,000+ SWITCHED",
            overlayStyle: { fontSize: 48, position: "top", animation: "pop" },
            transitionType: "cut",
            effects: { colorGrade: "warm" },
          },
          {
            sceneNumber: 2,
            durationSeconds: 5,
            scriptText: "Tired of watches that crack, die in the rain, or need replacing every year?",
            brollFolder: "comparison",
            transitionType: "cut",
            effects: { colorGrade: "desaturated" },
          },
          {
            sceneNumber: 3,
            durationSeconds: 5,
            scriptText: "Carbinox built different. Waterproof. Shockproof. And it comes with a lifetime warranty.",
            brollFolder: "durability-tests",
            overlayText: "LIFETIME WARRANTY",
            overlayStyle: { fontSize: 48, position: "center", animation: "pop" },
            transitionType: "dissolve",
            effects: { colorGrade: "cinematic" },
          },
          {
            sceneNumber: 4,
            durationSeconds: 5,
            scriptText: "Health tracking, GPS, notifications — everything you need on your wrist.",
            brollFolder: "watch-closeups",
            transitionType: "cut",
            effects: { zoom: true, colorGrade: "warm" },
          },
          {
            sceneNumber: 5,
            durationSeconds: 7,
            scriptText: "The Blaze starts at just $139. That's less than one year of your current watch's replacement cost.",
            brollFolder: "lifestyle",
            overlayText: "BLAZE — $139.95",
            overlayStyle: { fontSize: 48, position: "center", animation: "pop" },
            transitionType: "cut",
            effects: { colorGrade: "warm" },
          },
          {
            sceneNumber: 6,
            durationSeconds: 5,
            scriptText: "Join 200K+ and get yours today.",
            brollFolder: "offer-screens",
            overlayText: "SHOP NOW",
            overlayStyle: { fontSize: 56, position: "center", animation: "pop" },
            transitionType: "cut",
            effects: {},
          },
        ],
      },
    ],
  };
}
