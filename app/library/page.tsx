"use client";

import { useEffect, useState, useCallback } from "react";

interface BrollFolder {
  id: string;
  folderName: string;
  clipCount: number;
  driveFolderId: string;
  lastIndexed: string | null;
  tags: string[];
}

interface MusicTrack {
  id: string;
  title: string;
  mood: string;
  energyLevel: number;
  genre: string;
  bpm: number;
  durationSeconds: number;
}

interface Voice {
  id: string;
  name: string;
  gender: string;
  tone: string;
  energy: string;
  accent: string;
  elevenlabsVoiceId: string;
}

type Tab = "broll" | "music" | "voices";

export default function LibraryPage() {
  const [tab, setTab] = useState<Tab>("broll");
  const [brollFolders, setBrollFolders] = useState<BrollFolder[]>([]);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [indexing, setIndexing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [brollRes, musicRes, voicesRes] = await Promise.all([
        fetch("/api/library/broll"),
        fetch("/api/library/music"),
        fetch("/api/library/voices"),
      ]);

      if (brollRes.ok) setBrollFolders(await brollRes.json());
      if (musicRes.ok) setMusicTracks(await musicRes.json());
      if (voicesRes.ok) setVoices(await voicesRes.json());
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function indexBroll() {
    setIndexing(true);
    try {
      await fetch("/api/library/broll/index", { method: "POST" });
      await loadData();
    } finally {
      setIndexing(false);
    }
  }

  async function syncVoices() {
    setSyncing(true);
    try {
      await fetch("/api/library/voices/sync", { method: "POST" });
      await loadData();
    } finally {
      setSyncing(false);
    }
  }

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "broll", label: "B-Roll Footage", count: brollFolders.length },
    { id: "music", label: "Music Library", count: musicTracks.length },
    { id: "voices", label: "Voice Presets", count: voices.length },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Asset Library</h2>
        <p className="text-[var(--muted-foreground)]">
          Manage b-roll footage, music tracks, and voice presets
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-[var(--card)] border border-[var(--card-border)] w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              tab === t.id
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted-foreground)] hover:text-white"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse text-[var(--muted-foreground)] py-10">
          Loading...
        </div>
      ) : (
        <>
          {/* B-Roll Tab */}
          {tab === "broll" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Folders indexed from Google Drive b-roll library
                </p>
                <button
                  onClick={indexBroll}
                  disabled={indexing}
                  className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white text-sm transition-colors"
                >
                  {indexing ? "Indexing..." : "Re-Index from Drive"}
                </button>
              </div>

              {brollFolders.length === 0 ? (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
                  <p className="text-[var(--muted-foreground)] mb-2">
                    No b-roll folders indexed yet.
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Configure your Google Drive B-Roll folder in Settings, then click Re-Index.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {brollFolders.map((folder) => (
                    <div
                      key={folder.id}
                      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
                    >
                      <h4 className="font-medium mb-1">{folder.folderName}</h4>
                      <p className="text-2xl font-bold text-[var(--primary)]">
                        {folder.clipCount}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">clips</p>
                      {folder.tags && folder.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {folder.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {folder.lastIndexed && (
                        <p className="text-[10px] text-[var(--muted)] mt-2">
                          Last indexed: {new Date(folder.lastIndexed).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Music Tab */}
          {tab === "music" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Royalty-free tracks organized by mood and energy
                </p>
              </div>

              {musicTracks.length === 0 ? (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
                  <p className="text-[var(--muted-foreground)]">
                    No music tracks added yet.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--card-border)]">
                        <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-3">Title</th>
                        <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-3">Mood</th>
                        <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-3">Energy</th>
                        <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-3">Genre</th>
                        <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-3">BPM</th>
                        <th className="text-left text-xs text-[var(--muted-foreground)] font-medium p-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {musicTracks.map((track) => (
                        <tr key={track.id} className="border-b border-[var(--card-border)] last:border-0">
                          <td className="p-3 font-medium text-sm">{track.title}</td>
                          <td className="p-3 text-sm text-[var(--muted-foreground)]">{track.mood}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[var(--primary)]"
                                  style={{ width: `${(track.energyLevel / 10) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-[var(--muted)]">{track.energyLevel}</span>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-[var(--muted-foreground)]">{track.genre}</td>
                          <td className="p-3 text-sm text-[var(--muted-foreground)]">{track.bpm}</td>
                          <td className="p-3 text-sm text-[var(--muted-foreground)]">{Math.round(track.durationSeconds)}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Voices Tab */}
          {tab === "voices" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  ElevenLabs voices for ad voiceovers
                </p>
                <button
                  onClick={syncVoices}
                  disabled={syncing}
                  className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white text-sm transition-colors"
                >
                  {syncing ? "Syncing..." : "Sync from ElevenLabs"}
                </button>
              </div>

              {voices.length === 0 ? (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
                  <p className="text-[var(--muted-foreground)] mb-2">
                    No voices configured yet.
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Add your ElevenLabs API key in Settings, then click Sync.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {voices.map((voice) => (
                    <div
                      key={voice.id}
                      className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{voice.name}</h4>
                        <span className="text-xs text-[var(--muted)]">
                          {voice.elevenlabsVoiceId.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {voice.gender && (
                          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]">
                            {voice.gender}
                          </span>
                        )}
                        {voice.tone && (
                          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]">
                            {voice.tone}
                          </span>
                        )}
                        {voice.energy && (
                          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]">
                            {voice.energy}
                          </span>
                        )}
                        {voice.accent && (
                          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]">
                            {voice.accent}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
