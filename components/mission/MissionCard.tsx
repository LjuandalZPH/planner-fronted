"use client";

import { ScrollText, Zap, Trash2, Coins, FileCheck, CircleSlash } from "lucide-react";
import {
  RARITY_LABELS,
  getRarityCardTheme,
  getXpForRarity,
  getFocusComboGoldMultiplier,
  type MissionRarity,
} from "@/lib/gamification";
import { useScrollFocus } from "@/context/scroll-focus-context";

export interface Mission {
  id: string;
  title: string;
  description: string;
  rarity: MissionRarity;
  progress: number;
}

interface MissionCardProps {
  mission: Mission;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  isCompleting?: boolean;
  /** Void Credits paid on seal — derived from rarity × rank at listing time (parent passes). */
  voidCreditsReward?: number;
}

function formatFocusClock(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MissionCard({
  mission,
  onComplete,
  onDelete,
  isCompleting = false,
  voidCreditsReward,
}: MissionCardProps) {
  const scrollFocus = useScrollFocus();
  const isComplete = mission.progress >= 100;
  const theme = getRarityCardTheme(mission.rarity);
  const rewardXp = getXpForRarity(mission.rarity);

  const activeId = scrollFocus.activeSession?.missionId ?? null;
  const isFocused = activeId === mission.id && scrollFocus.remainingMs > 0;
  const focusElsewhere =
    activeId !== null && activeId !== mission.id && !isComplete;
  const comboTier = scrollFocus.activeSession?.comboTier ?? 0;
  const comboMult = getFocusComboGoldMultiplier(comboTier);
  const scrollRunningHere =
    scrollFocus.activeSession?.missionId === mission.id &&
    scrollFocus.remainingMs > 0;

  const articleTone = isComplete
    ? ""
    : focusElsewhere
      ? "opacity-[0.58] saturate-[0.48]"
      : isFocused
        ? "ring-2 ring-cyan-400/50 shadow-[0_0_36px_rgba(34,211,238,0.32)]"
        : "";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-linear-to-b from-slate-900 to-slate-950 transition-all duration-300 hover:-translate-y-1 ${theme.articleBase} ${articleTone}`}
    >
      {isFocused ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.14)_0%,transparent_55%)]"
          aria-hidden
        />
      ) : null}

      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${theme.rarityGlow}`}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className={`flex min-w-0 flex-1 flex-col gap-2 ${!isComplete ? "pr-2 sm:pr-16" : ""}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${theme.badge}`}
              >
                {RARITY_LABELS[mission.rarity]}
              </span>
            </div>

            <h3
              className={`font-cinzel text-lg font-bold leading-snug ${
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
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-cyan-400 bg-cyan-400/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-400">
              <ScrollText size={12} />
              <span>Sealed</span>
            </div>
          )}
        </div>

        {/* XP */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${theme.xpPill}`}
          >
            <Zap size={14} />
            {rewardXp} XP
          </span>
          {voidCreditsReward !== undefined ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-950/55 px-3 py-1 text-sm font-bold text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.2)]">
              <Coins size={14} className="text-amber-400" aria-hidden />
              +{voidCreditsReward} Void
            </span>
          ) : null}
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
                  : `${theme.progressIncomplete} shadow-[0_0_10px_rgba(255,255,255,0.08)]`
              }`}
              style={{ width: `${mission.progress}%` }}
            />
          </div>
        </div>

        {/* Scroll of Focus — energy + clock */}
        {isFocused && !isComplete ? (
          <div className="mt-5 space-y-2 border-t border-cyan-500/20 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/90">
                Scroll of Focus
              </span>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <div className="flex items-center gap-2 font-mono text-sm font-semibold text-cyan-100 tabular-nums">
                  <span>{formatFocusClock(scrollFocus.remainingMs)}</span>
                  {comboTier >= 1 ? (
                    <span
                      className="inline-flex items-center gap-0.5 rounded-full border border-orange-500/40 bg-orange-950/50 px-2 py-0.5 text-[11px] font-bold text-orange-100"
                      title={`Multiplicador de oro al cerrar el bloque: ×${comboMult.toFixed(1)}`}
                    >
                      <span aria-hidden>🔥</span>
                      <span>×{comboMult.toFixed(1)}</span>
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => scrollFocus.abandonFocusScroll(mission.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-500/45 bg-red-950/40 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-100 transition hover:border-red-400 hover:bg-red-950/70"
                  aria-label="Extinguish scroll of focus"
                  title="Romper el voto de enfoque (penalización en Void)"
                >
                  <CircleSlash size={14} className="shrink-0" aria-hidden />
                  <span className="hidden sm:inline">Extinguish</span>
                </button>
              </div>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full border border-cyan-500/25 bg-slate-900/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(scrollFocus.energyRatio * 100)}
              aria-label="Energía del pergamino de enfoque"
            >
              <div
                className="h-full rounded-full bg-linear-to-r from-cyan-400 via-sky-400 to-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.55)] transition-[width] duration-300 ease-linear"
                style={{ width: `${Math.max(0, scrollFocus.energyRatio * 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* Actions */}
        {!isComplete && (onComplete || onDelete) && (
          <div className="mt-5 flex gap-3 border-t border-slate-800 pt-5">
            {onComplete && (
              <>
                <button
                  type="button"
                  onClick={() => scrollFocus.activateScroll(mission.id)}
                  disabled={scrollRunningHere || isCompleting}
                  aria-label="Activate Scroll of Focus"
                  title={
                    scrollRunningHere
                      ? "El pergamino ya está activo en este contrato"
                      : "Iniciar bloque de enfoque (25 min)"
                  }
                  className={`flex shrink-0 items-center justify-center rounded-lg border px-3 py-3 transition sm:px-4 ${
                    scrollRunningHere
                      ? "cursor-default border-cyan-500/40 bg-cyan-950/40 text-cyan-200"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-100"
                  } disabled:opacity-60`}
                >
                  <ScrollText size={18} aria-hidden />
                  <span className="ml-2 hidden font-cinzel text-[11px] font-bold uppercase tracking-wide sm:inline">
                    Scroll of Focus
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onComplete(mission.id)}
                  disabled={isCompleting}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-slate-950 transition ${
                    isCompleting
                      ? "animate-pulse-cyan bg-linear-to-br from-cyan-400 to-cyan-500 opacity-80 cursor-default"
                      : "bg-linear-to-br from-cyan-600 to-cyan-700 hover:opacity-90"
                  }`}
                >
                  <FileCheck size={18} aria-hidden />
                  <span>Seal Contract</span>
                </button>
              </>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(mission.id)}
                className="flex items-center justify-center rounded-lg border border-slate-800 p-3 text-slate-400 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-500"
                aria-label="Delete mission"
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
