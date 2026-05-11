"use client";

import { Scroll, Zap, Trash2 } from "lucide-react";

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
}

interface MissionCardProps {
  mission: Mission;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  isCompleting?: boolean;
}

export function MissionCard({
  mission,
  onComplete,
  onDelete,
  isCompleting = false,
}: MissionCardProps) {
  const isComplete = mission.progress >= 100;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-b from-slate-900 to-slate-950 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.15),0_20px_40px_-15px_rgba(0,0,0,0.5)]">
      
      {/* Glow hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.08)_0%,transparent_60%)]" />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className={`flex-1 ${!isComplete ? "pr-16" : ""}`}>
            <h3
              className={`font-cinzel mb-2 text-lg font-bold leading-snug ${
                isComplete
                  ? "text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                  : "text-slate-50"
              }`}
            >
              {mission.title}
            </h3>

            {mission.description && (
              <p className="text-sm leading-relaxed text-slate-400">
                {mission.description}
              </p>
            )}
          </div>

          {isComplete && (
            <div className="flex items-center gap-1 rounded-full border border-cyan-400 bg-cyan-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-400">
              <Scroll size={12} />
              <span>Sealed</span>
            </div>
          )}
        </div>

        {/* XP */}
        <div className="mb-4 flex items-center gap-2">
          <span className="animate-glow-gold inline-flex items-center gap-1 rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 px-3 py-1 text-sm font-bold text-yellow-900">
            <Zap size={14} />
            {mission.xp} XP
          </span>
        </div>

        {/* Progress */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Progress
            </span>
            <span
              className={`text-xs font-semibold ${
                isComplete ? "text-cyan-400" : "text-slate-50"
              }`}
            >
              {mission.progress}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isComplete
                  ? "bg-linear-to-r from-cyan-400 to-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  : "bg-linear-to-r from-purple-500 to-indigo-500"
              }`}
              style={{ width: `${mission.progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        {!isComplete && (onComplete || onDelete) && (
          <div className="mt-5 flex gap-3 border-t border-slate-800 pt-5">
            {onComplete && (
              <button
                onClick={() => onComplete(mission.id)}
                disabled={isCompleting}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-slate-950 transition ${
                  isCompleting
                    ? "animate-pulse-cyan bg-linear-to-br from-cyan-400 to-cyan-500 opacity-80 cursor-default"
                    : "bg-linear-to-br from-cyan-600 to-cyan-700 hover:opacity-90"
                }`}
              >
                <Scroll size={18} />
                <span>Seal Contract</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(mission.id)}
                className="flex items-center justify-center rounded-lg border border-slate-800 p-3 text-slate-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}