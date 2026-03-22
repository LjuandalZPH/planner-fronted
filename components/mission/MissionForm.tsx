"use client";

import { useState, type FormEvent } from "react";
import { Button } from "../ui/button";

interface MissionFormProps {
  onSubmit?: (data: {
    title: string;
    description: string;
    xp: number;
  }) => void;
}

export function MissionForm({ onSubmit }: MissionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xp, setXp] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    onSubmit?.({
      title: title.trim(),
      description: description.trim(),
      xp: Math.max(1, Math.min(1000, xp)),
    });

    setTitle("");
    setDescription("");
    setXp(10);
    setIsSubmitting(false);
  }

  return (
    <section className="rounded-2xl border border-slate-200 p-6 bg-linear-to-br from-slate-800 to-slate-900 shadow-xl">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-slate-50 text-xl font-bold mb-1">
          Nueva Misión
        </h2>
        <p className="text-slate-400 text-sm">
          Crea una nueva misión para empezar tu aventura
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="mission-title"
            className="text-slate-300 text-sm font-medium"
          >
            Título
          </label>
          <input
            id="mission-title"
            placeholder="Ej: Completar proyecto final"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-4 py-3 rounded-md border border-slate-600 bg-slate-900 text-slate-100 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="mission-description"
            className="text-slate-300 text-sm font-medium"
          >
            Descripción
          </label>
          <textarea
            id="mission-description"
            placeholder="Describe los detalles de tu misión..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="px-4 py-3 rounded-md border border-slate-600 bg-slate-900 text-slate-100 text-sm resize-y min-h- outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* XP */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="mission-xp"
            className="text-slate-300 text-sm font-medium"
          >
            XP (1-1000)
          </label>

          <div className="relative">
            <input
              id="mission-xp"
              type="number"
              min={1}
              max={1000}
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              className="w-full px-4 py-3 pr-14 rounded-md border border-slate-600 bg-slate-900 text-slate-100 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm pointer-events-none">
              XP
            </span>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="mt-2 px-6 py-3 disabled:opacity-60"
        >
          {isSubmitting ? "Creando..." : "Crear Misión"}
        </Button>
      </form>
    </section>
  );
}