"use client";

import { Zap, Swords, Target } from "lucide-react";

interface HeroProfileProps {
  level: number;
  xp: number;
  nextLevelXP: number;
  totalMissions: number;
  completedMissions: number;
}

export function HeroProfile({
  level,
  xp,
  nextLevelXP,
  totalMissions,
  completedMissions,
}: HeroProfileProps) {
  const xpProgress = Math.round((xp / nextLevelXP) * 100);

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-b from-slate-900 to-slate-950">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.08)_0%,transparent_50%)]" />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.4)]">
            <Swords size={24} className="text-yellow-900" />
          </div>

          <div>
            <p className="font-cinzel mb-0.5 text-xs font-semibold uppercase tracking-widest text-yellow-400">
              Level
            </p>
            <p className="font-cinzel animate-glow-gold text-3xl font-extrabold leading-none text-yellow-400">
              {level}
            </p>
          </div>
        </div>

        {/* XP */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="animate-glow-gold text-yellow-400" />
              <span className="text-sm font-semibold text-slate-50">
                {xp}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {nextLevelXP} XP
            </span>
          </div>

          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-yellow-400 to-amber-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {/* Missions */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
            <div className="mb-1 flex items-center justify-center gap-1.5">
              <Target size={16} className="text-purple-500" />
              <span className="text-xl font-bold text-slate-50">
                {totalMissions}
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              Missions
            </span>
          </div>

          {/* Completed */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">
            <div className="mb-1 flex items-center justify-center gap-1.5">
              <Zap size={16} className="animate-glow-cyan text-cyan-400" />
              <span className="text-xl font-bold text-cyan-400">
                {completedMissions}
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              Finished
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}