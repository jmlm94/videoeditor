"use client";

import { useEffect, useState } from "react";

const SETTINGS_SCHEMA = [
  {
    section: "API Keys",
    fields: [
      { key: "anthropic_api_key", label: "Anthropic API Key", type: "password", placeholder: "sk-ant-..." },
      { key: "elevenlabs_api_key", label: "ElevenLabs API Key", type: "password", placeholder: "..." },
    ],
  },
  {
    section: "Google Drive",
    fields: [
      { key: "google_client_id", label: "Client ID", type: "text", placeholder: "Your Google OAuth Client ID" },
      { key: "google_client_secret", label: "Client Secret", type: "password", placeholder: "Your Google OAuth Client Secret" },
      { key: "google_broll_folder_id", label: "B-Roll Library Folder ID", type: "text", placeholder: "Google Drive folder ID for b-roll footage" },
      { key: "google_winners_folder_id", label: "Winning Ads Folder ID", type: "text", placeholder: "Google Drive folder ID for winning ads" },
      { key: "google_output_folder_id", label: "Output Folder ID", type: "text", placeholder: "Google Drive folder ID for rendered output" },
    ],
  },
  {
    section: "Brand Knowledge",
    fields: [
      { key: "brand_repo_url", label: "GitHub Repo URL", type: "text", placeholder: "https://github.com/org/brand-knowledge" },
    ],
  },
  {
    section: "Rendering",
    fields: [
      { key: "render_service", label: "Render Service", type: "text", placeholder: "local (default) or remotion-lambda" },
      { key: "render_concurrency", label: "Render Concurrency", type: "text", placeholder: "2" },
    ],
  },
  {
    section: "Trend Scraping",
    fields: [
      { key: "trend_scraping_enabled", label: "Enable Trend Scraping", type: "text", placeholder: "true / false" },
      { key: "trend_scraping_keywords", label: "Keywords", type: "text", placeholder: "DTC, smartwatch, rugged watch, ecommerce ads" },
      { key: "trend_scraping_interval_hours", label: "Scrape Interval (hours)", type: "text", placeholder: "24" },
    ],
  },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setValues(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="animate-pulse text-[var(--muted-foreground)]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Settings</h2>
          <p className="text-[var(--muted-foreground)]">
            Configure API keys, integrations, and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-[var(--success)]">Saved!</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {SETTINGS_SCHEMA.map((section) => (
          <div
            key={section.section}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
          >
            <h3 className="font-semibold mb-4">{section.section}</h3>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm text-[var(--muted-foreground)] mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={values[field.key] || ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
