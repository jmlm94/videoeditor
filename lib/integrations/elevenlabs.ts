const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface GenerateVoiceoverParams {
  text: string;
  voiceId: string;
  settings?: Partial<VoiceSettings>;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true,
};

export async function generateVoiceover({
  text,
  voiceId,
  settings = {},
}: GenerateVoiceoverParams): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  const res = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { ...DEFAULT_SETTINGS, ...settings },
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`ElevenLabs API error: ${res.status} ${error}`);
  }

  return res.arrayBuffer();
}

export async function listVoices(): Promise<
  Array<{ voice_id: string; name: string; labels: Record<string, string> }>
> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    // Return preset voices when no API key
    return [
      { voice_id: "pNInz6obpgDQGcFmaJgB", name: "Adam", labels: { accent: "american", gender: "male", use_case: "narration" } },
      { voice_id: "ErXwobaYiN019PkySvjV", name: "Antoni", labels: { accent: "american", gender: "male", use_case: "narration" } },
      { voice_id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", labels: { accent: "american", gender: "female", use_case: "narration" } },
      { voice_id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", labels: { accent: "american", gender: "female", use_case: "narration" } },
      { voice_id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", labels: { accent: "american", gender: "male", use_case: "narration" } },
    ];
  }

  const res = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: { "xi-api-key": apiKey },
  });

  if (!res.ok) throw new Error(`ElevenLabs API error: ${res.status}`);

  const data = await res.json();
  return data.voices;
}
