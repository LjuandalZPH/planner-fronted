"use client";

import { Zap, Swords, Sparkles, Target, Flame, Coins } from "lucide-react";
import {
  getRankForLevel,
  getRankTitlePresentation,
} from "@/lib/gamification";
import { formatVoidCredits } from "@/lib/utils";

interface HeroProfileProps {
  level: number;
  xp: number;
  nextLevelXP: number;
  totalMissions: number;
  completedMissions: number;
  /** True briefly when level-up crossed into a new narrative rank tier */
  rankUpActive?: boolean;
  /** Consecutive days with at least one sealed contract (after app-open rules). */
  currentStreak?: number;
  /** Streak greater than 0 but nothing sealed yet today — softer styling to nudge a seal. */
  streakAtRisk?: boolean;
  /** Animated Void Credits (Oro del Vacío) balance from the economy layer. */
  voidCreditsDisplay?: number;
}

export function HeroProfile({
  level,
  xp,
  nextLevelXP,
  totalMissions,
  completedMissions,
  rankUpActive = false,
  currentStreak = 0,
  streakAtRisk = false,
  voidCreditsDisplay,
}: HeroProfileProps) {
  const xpProgress = Math.round((xp / nextLevelXP) * 100);
  const rank = getRankForLevel(level);
  const rankStyle = getRankTitlePresentation(rank.tierIndex);
  const streakActive = currentStreak > 0 && !streakAtRisk;

  return (
    <aside
      className={`relative overflow-hidden rounded-2xl border bg-linear-to-b from-slate-900 to-slate-950 transition-[box-shadow,border-color] duration-500 ${
        rankUpActive
          ? "border-cyan-400/45 shadow-[0_0_32px_rgba(34,211,238,0.35)]"
          : "border-slate-800"
      }`}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(250,204,21,0.08)_0%,transparent_50%)]" />

      {rankUpActive ? (
        <div
          role="status"
          aria-live="polite"
          className="relative border-b border-cyan-500/25 bg-linear-to-r from-cyan-950/80 via-slate-900/90 to-amber-950/40 px-4 py-2"
        >
          <p className="flex items-center justify-center gap-2 text-center font-cinzel text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]">
            <Sparkles size={14} className="shrink-0 text-amber-300" aria-hidden />
            Rank ascended — your title has evolved
          </p>
        </div>
      ) : null}

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-transform duration-500 ${
              rankUpActive ? "scale-105" : ""
            }`}
          >
            <Swords size={24} className="text-yellow-900" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-cinzel mb-0.5 text-xs font-semibold uppercase tracking-widest text-yellow-400">
              Level
            </p>
            <p className="font-cinzel animate-glow-gold text-3xl font-extrabold leading-none text-yellow-400">
              {level}
            </p>
            <div className="mt-1.5 space-y-0.5">
              <p
                className={`font-cinzel text-[11px] font-semibold leading-tight tracking-wide transition-colors duration-300 ${rankStyle.englishClass}`}
              >
                {rank.titleEn}
              </p>
              <p
                className={`font-cinzel text-[10px] font-medium leading-tight tracking-wide italic transition-colors duration-300 ${rankStyle.spanishClass}`}
              >
                {rank.titleEs}
              </p>
            </div>
          </div>

          <div
            className={`shrink-0 rounded-xl border px-3 py-2 text-center transition-all duration-300 ${
              streakActive
                ? "border-orange-500/50 bg-linear-to-b from-orange-950/80 to-slate-950 shadow-[0_0_20px_rgba(249,115,22,0.35)]"
                : "border-slate-800 bg-slate-950/90"
            }`}
            role="status"
            aria-label={
              streakAtRisk && currentStreak > 0
                ? `Racha en riesgo: ${currentStreak} días, sella un contrato hoy`
                : `Racha: ${currentStreak} días`
            }
          >
            <div className="mb-0.5 flex items-center justify-center gap-1">
              <Flame
                size={18}
                className={
                  streakActive
                    ? "text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.85)]"
                    : currentStreak > 0
                      ? "text-slate-600"
                      : "text-slate-700"
                }
                aria-hidden
              />
            </div>
            <p
              className={`font-cinzel text-lg font-extrabold leading-none tabular-nums ${
                streakActive
                  ? "text-orange-300 drop-shadow-[0_0_12px_rgba(251,146,60,0.5)]"
                  : "text-slate-500"
              }`}
            >
              {currentStreak}
            </p>
            <p className="mt-0.5 font-cinzel text-[9px] font-semibold uppercase tracking-wider text-slate-500">
              Racha
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

        {voidCreditsDisplay !== undefined ? (
          <div className="mb-5 rounded-xl border border-amber-900/40 bg-linear-to-r from-slate-950/90 via-amber-950/25 to-slate-950/90 px-4 py-3 shadow-[0_0_24px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]" aria-hidden />
                <span className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/90">
                  Void Credits
                </span>
              </div>
              <span
                className="font-cinzel text-lg font-extrabold tabular-nums text-amber-100 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                aria-live="polite"
              >
                {formatVoidCredits(voidCreditsDisplay)}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Earned by sealing contracts — spent in the Black Market.</p>
          </div>
        ) : null}

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