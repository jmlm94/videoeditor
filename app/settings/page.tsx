export default function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Settings</h2>
        <p className="text-[var(--muted-foreground)]">
          Configure API keys, integrations, and preferences
        </p>
      </div>

      <div className="space-y-6">
        <SettingsSection title="API Keys">
          <SettingsField label="Anthropic API Key" placeholder="sk-ant-..." type="password" />
          <SettingsField label="ElevenLabs API Key" placeholder="..." type="password" />
        </SettingsSection>

        <SettingsSection title="Google Drive">
          <SettingsField label="B-Roll Library Folder ID" placeholder="Google Drive folder ID" />
          <SettingsField label="Winning Ads Folder ID" placeholder="Google Drive folder ID" />
          <SettingsField label="Output Folder ID" placeholder="Google Drive folder ID" />
        </SettingsSection>

        <SettingsSection title="Brand Knowledge">
          <SettingsField
            label="GitHub Repo URL"
            placeholder="https://github.com/org/brand-knowledge"
          />
        </SettingsSection>

        <SettingsSection title="Rendering">
          <SettingsField label="Render Service" placeholder="remotion-lambda / local" />
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingsField({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-[var(--muted-foreground)] mb-1">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
      />
    </div>
  );
}
