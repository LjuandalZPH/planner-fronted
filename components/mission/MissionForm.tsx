"use client";

import { useState, type FormEvent } from "react";
import {
  CircleDot,
  Coins,
  Crown,
  Gem,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  MISSION_RARITIES,
  RARITY_LABELS,
  RARITY_XP,
  getRarityBountyPanelPresentation,
  getRarityPickerPresentation,
  getVoidCreditsForMissionSeal,
  getXpForRarity,
  missionCreateFormSchema,
  type MissionRarity,
} from "@/lib/gamification";
import { formatVoidCredits } from "@/lib/utils";

interface MissionFormProps {
  onSubmit?: (data: {
    title: string;
    description: string;
    rarity: MissionRarity;
  }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  /** Hero level — drives Void Credits preview on rarity cards and bounty panel. */
  playerLevel?: number;
}

const RARITY_FIELDSET_LABEL = "Contract rarity";

const RARITY_ICONS: Record<MissionRarity, LucideIcon> = {
  common: CircleDot,
  rare: Sparkles,
  epic: Gem,
  legendary: Crown,
};

export function MissionForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  playerLevel = 1,
}: MissionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<MissionRarity>("common");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const parsed = missionCreateFormSchema.safeParse({
      title,
      description,
      rarity,
    });

    if (!parsed.success) return;

    onSubmit?.({
      title: parsed.data.title,
      description: parsed.data.description,
      rarity: parsed.data.rarity,
    });
  }

  const previewXp = getXpForRarity(rarity);
  const previewVoid = getVoidCreditsForMissionSeal(rarity, playerLevel);
  const bounty = getRarityBountyPanelPresentation(rarity);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10"
    >
      {/* Left: contract data + tier pick + actions */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
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
            rows={4}
            className="resize-none rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500"
          />
        </div>

        <fieldset className="flex flex-col gap-3 border-0 p-0">
          <div className="mb-0.5 flex flex-col gap-0.5">
            <legend className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {RARITY_FIELDSET_LABEL}
            </legend>
            <p className="text-[11px] text-slate-500">
              Each tier glows with its own power — XP and Void Credits scale with your rank.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label={RARITY_FIELDSET_LABEL}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {MISSION_RARITIES.map((value) => {
              const isSelected = rarity === value;
              const pick = getRarityPickerPresentation(value, isSelected);
              const Icon = RARITY_ICONS[value];
              const voidForTier = getVoidCreditsForMissionSeal(value, playerLevel);

              return (
                <label
                  key={value}
                  className={`${pick.labelClass} min-h-[7.25rem]`}
                >
                  <span className={pick.ambientGlowClass} aria-hidden />
                  <input
                    type="radio"
                    name="mission-rarity"
                    value={value}
                    checked={isSelected}
                    onChange={() => setRarity(value)}
                    className="sr-only"
                  />
                  <Icon
                    className={`relative z-[1] h-7 w-7 shrink-0 ${pick.iconClass}`}
                    strokeWidth={isSelected ? 2.25 : 2}
                    aria-hidden
                  />
                  <span
                    className={`relative z-[1] text-[11px] font-bold uppercase tracking-widest ${pick.titleClass}`}
                  >
                    {RARITY_LABELS[value]}
                  </span>
                  <span
                    className={`relative z-[1] text-[10px] font-semibold uppercase tracking-wide ${pick.xpLineClass}`}
                  >
                    {RARITY_XP[value]} XP
                  </span>
                  <span className="relative z-[1] flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wide text-amber-400/95 drop-shadow-[0_0_8px_rgba(251,191,36,0.25)] group-hover:text-amber-300/95">
                    <Coins className="h-3 w-3 shrink-0 opacity-90" aria-hidden />
                    +{formatVoidCredits(voidForTier)} Void
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-auto flex gap-3 pt-1">
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
            className={`min-w-[10rem] flex-[1.35] rounded-lg px-5 py-3 text-sm font-bold text-slate-50 transition ${
              isSubmitting
                ? "animate-pulse-cyan bg-linear-to-br from-cyan-400 to-cyan-500 opacity-80 cursor-default"
                : "bg-linear-to-br from-cyan-600 to-cyan-700 hover:opacity-90"
            } ${!title.trim() ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Creando..." : "Accept Contract"}
          </button>
        </div>
      </div>

      {/* Right: bounty board (immersive) */}
      <div className="flex w-full shrink-0 flex-col lg:w-[min(100%,22rem)] xl:w-[min(100%,26rem)]">
        <div className={`${bounty.container} flex h-full min-h-[280px] flex-col lg:sticky lg:top-2`}>
          <div className={bounty.innerGlow} aria-hidden />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/30 to-transparent"
            aria-hidden
          />
          <div className="relative flex flex-1 flex-col justify-between gap-6 p-1 sm:p-2">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                Sealed bounty preview
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col">
                  <span className="font-cinzel text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Experience
                  </span>
                  <div className="flex flex-wrap items-end gap-1.5">
                    <span className={bounty.valueClass}>{previewXp}</span>
                    <span className="mb-1 font-cinzel text-lg font-semibold text-slate-400">
                      XP
                    </span>
                  </div>
                </div>
                <div className="h-12 w-px shrink-0 bg-linear-to-b from-transparent via-slate-600/60 to-transparent" aria-hidden />
                <div className="flex flex-col">
                  <span className="font-cinzel text-[10px] font-semibold uppercase tracking-widest text-amber-500/90">
                    Void credits
                  </span>
                  <div className="flex flex-wrap items-end gap-1.5">
                    <span className="font-cinzel text-3xl font-extrabold tabular-nums text-amber-100 drop-shadow-[0_0_20px_rgba(251,191,36,0.35)] md:text-4xl">
                      {formatVoidCredits(previewVoid)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="max-w-none text-xs leading-relaxed text-slate-400">
                Payouts reflect your current rank — seal the contract later to claim the
                full bounty in XP and Oro del Vacío for the Black Market.
              </p>
            </div>
            <div className="relative flex shrink-0 justify-center">
              <div
                className="absolute inset-0 scale-150 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_65%)] blur-2xl"
                aria-hidden
              />
              <div className="relative flex items-center gap-4">
                <Zap
                  className={`h-16 w-16 sm:h-20 sm:w-20 ${bounty.zapClass}`}
                  strokeWidth={1.5}
                  aria-hidden
                />
                <Coins
                  className="h-14 w-14 text-amber-300 drop-shadow-[0_0_22px_rgba(251,191,36,0.45)] sm:h-[4.5rem] sm:w-[4.5rem]"
                  strokeWidth={1.35}
                  aria-hidden
                />
              </div>
            </div>
            <div
              className={`relative mx-auto h-px w-4/5 max-w-sm ${bounty.accentLine}`}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </form>
  );
}
