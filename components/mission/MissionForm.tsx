"use client";

import { useState, type FormEvent } from "react";
import { Zap } from "lucide-react";

interface MissionFormProps {
  onSubmit?: (data: {
    title: string;
    description: string;
    xp: number;
  }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function MissionForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: MissionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xp, setXp] = useState(10);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    onSubmit?.({
      title: title.trim(),
      description: description.trim(),
      xp: Math.max(1, Math.min(1000, xp)),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {/* Title */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="mission-title"
          className="text-xs font-medium uppercase tracking-wide text-slate-400"
        >
          Mission Title
        </label>

        <input
          id="mission-title"
          placeholder="Ej: Finish final project"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="mission-description"
          className="text-xs font-medium uppercase tracking-wide text-slate-400"
        >
          Description
        </label>

        <textarea
          id="mission-description"
          placeholder="Describe mission details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500"
        />
      </div>

      {/* XP */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="mission-xp"
          className="text-xs font-medium uppercase tracking-wide text-slate-400"
        >
          Bounty XP
        </label>

        <div className="relative">
          <input
            id="mission-xp"
            type="number"
            min={1}
            max={1000}
            value={xp}
            onChange={(e) => setXp(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 pr-12 text-sm text-slate-50 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />

          <Zap
            size={16}
            className="animate-glow-gold absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400"
          />
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Value between 1 and 1000 XP
        </p>
      </div>

      {/* Actions */}
      <div className="mt-2 flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-slate-800 px-5 py-3 text-sm font-semibold text-slate-400 transition hover:border-slate-600 hover:text-slate-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className={`flex-2 rounded-lg px-5 py-3 text-sm font-bold text-slate-50 transition ${
            isSubmitting
              ? "animate-pulse-cyan bg-linear-to-br from-cyan-400 to-cyan-500 opacity-80 cursor-default"
              : "bg-linear-to-br from-cyan-600 to-cyan-700 hover:opacity-90"
          } ${!title.trim() ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? "Creando..." : "Accept Contract"}
        </button>
      </div>
    </form>
  );
}