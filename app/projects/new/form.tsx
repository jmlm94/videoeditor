"use client";

import { useState } from "react";

const INPUT_TYPES = [
  {
    id: "concept",
    label: "New Concept",
    description: "Start from a fresh idea or creative direction",
    placeholder:
      'e.g., "CEO-angle ads talking about our 5th Anniversary offers with lifetime warranty as the main hook"',
  },
  {
    id: "iteration",
    label: "Iterate on Winners",
    description: "Create variations of top performing ads with different hooks",
    placeholder:
      'e.g., "Take our top 3 performing ads and create variations with urgency-based hooks"',
  },
  {
    id: "trend",
    label: "Trend-Based",
    description: "Build ads based on current DTC video ad trends",
    placeholder:
      'e.g., "What\'s working in DTC right now? Build me UGC-style ads for the Blaze smartwatch"',
  },
] as const;

export function NewProjectForm() {
  const [inputType, setInputType] = useState<string>("concept");
  const [prompt, setPrompt] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedType = INPUT_TYPES.find((t) => t.id === inputType)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || !projectName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          inputType,
          inputPrompt: prompt,
        }),
      });

      if (res.ok) {
        const { id } = await res.json();
        window.location.href = `/projects/${id}/brief`;
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input Type Selection */}
      <div className="grid grid-cols-3 gap-3">
        {INPUT_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setInputType(type.id)}
            className={`p-4 rounded-xl border text-left transition-colors ${
              inputType === type.id
                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--muted)]"
            }`}
          >
            <p className="font-medium text-sm">{type.label}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {type.description}
            </p>
          </button>
        ))}
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Project Name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g., Q2 Blaze Campaign"
          className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          required
        />
      </div>

      {/* Creative Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Creative Direction
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={selectedType.placeholder}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || !prompt.trim() || !projectName.trim()}
        className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
      >
        {isSubmitting ? "Generating Brief..." : "Generate Creative Brief"}
      </button>
    </form>
  );
}
