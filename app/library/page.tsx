export default function LibraryPage() {
  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Asset Library</h2>
        <p className="text-[var(--muted-foreground)]">
          Manage b-roll footage, music tracks, and voice presets
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="font-semibold mb-2">B-Roll Footage</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Connected via Google Drive. Indexed folders with tagged clips.
          </p>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-[var(--muted-foreground)]">folders indexed</p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="font-semibold mb-2">Music Library</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Royalty-free tracks organized by mood and energy.
          </p>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-[var(--muted-foreground)]">tracks available</p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="font-semibold mb-2">Voice Presets</h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            ElevenLabs voices configured for different ad styles.
          </p>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-[var(--muted-foreground)]">voices configured</p>
        </div>
      </div>
    </div>
  );
}
