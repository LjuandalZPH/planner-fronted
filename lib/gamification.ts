import { z } from "zod";

export const MISSION_RARITIES = ["common", "rare", "epic", "legendary"] as const;
export type MissionRarity = (typeof MISSION_RARITIES)[number];

export const RARITY_XP: Record<MissionRarity, number> = {
  common: 10,
  rare: 30,
  epic: 70,
  legendary: 150,
};

export const RARITY_LABELS: Record<MissionRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export function getXpForRarity(rarity: MissionRarity): number {
  return RARITY_XP[rarity];
}

export const missionRaritySchema = z.enum(MISSION_RARITIES);

export const missionCreateFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim(),
  rarity: missionRaritySchema,
});

export type MissionCreateFormInput = z.infer<typeof missionCreateFormSchema>;

export interface MissionRarityCardTheme {
  articleBase: string;
  rarityGlow: string;
  badge: string;
  xpPill: string;
  progressIncomplete: string;
}

export function getRarityCardTheme(rarity: MissionRarity): MissionRarityCardTheme {
  switch (rarity) {
    case "common":
      return {
        articleBase:
          "border-slate-600/90 shadow-[0_0_24px_rgba(148,163,184,0.12)] hover:border-slate-400 hover:shadow-[0_0_32px_rgba(148,163,184,0.18),0_20px_40px_-15px_rgba(0,0,0,0.5)]",
        rarityGlow:
          "bg-[radial-gradient(ellipse_at_top_right,rgba(148,163,184,0.12)_0%,transparent_55%)]",
        badge:
          "border-slate-500/60 bg-slate-800/80 text-slate-200 ring-1 ring-slate-500/30",
        xpPill:
          "bg-linear-to-br from-slate-500 to-slate-600 text-slate-50 shadow-[0_0_12px_rgba(148,163,184,0.25)]",
        progressIncomplete: "bg-linear-to-r from-slate-500 to-slate-400",
      };
    case "rare":
      return {
        articleBase:
          "border-cyan-500/45 shadow-[0_0_28px_rgba(34,211,238,0.18)] hover:border-cyan-400 hover:shadow-[0_0_36px_rgba(34,211,238,0.28),0_20px_40px_-15px_rgba(0,0,0,0.5)]",
        rarityGlow:
          "bg-[radial-gradient(ellipse_at_top_right,rgba(34,211,238,0.14)_0%,transparent_55%)]",
        badge:
          "border-cyan-400/50 bg-cyan-950/60 text-cyan-300 ring-1 ring-cyan-400/35",
        xpPill:
          "bg-linear-to-br from-cyan-500 to-sky-600 text-slate-950 shadow-[0_0_14px_rgba(34,211,238,0.45)]",
        progressIncomplete: "bg-linear-to-r from-cyan-500 to-sky-500",
      };
    case "epic":
      return {
        articleBase:
          "border-purple-500/50 shadow-[0_0_28px_rgba(168,85,247,0.22)] hover:border-purple-400 hover:shadow-[0_0_38px_rgba(168,85,247,0.32),0_20px_40px_-15px_rgba(0,0,0,0.5)]",
        rarityGlow:
          "bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.16)_0%,transparent_55%)]",
        badge:
          "border-purple-400/55 bg-purple-950/50 text-purple-200 ring-1 ring-purple-400/35",
        xpPill:
          "bg-linear-to-br from-purple-500 to-violet-600 text-slate-50 shadow-[0_0_14px_rgba(168,85,247,0.45)]",
        progressIncomplete: "bg-linear-to-r from-purple-500 to-violet-600",
      };
    case "legendary":
      return {
        articleBase:
          "border-amber-400/55 shadow-[0_0_30px_rgba(251,191,36,0.22)] hover:border-amber-300 hover:shadow-[0_0_42px_rgba(251,191,36,0.35),0_20px_40px_-15px_rgba(0,0,0,0.5)]",
        rarityGlow:
          "bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.14)_0%,transparent_55%)]",
        badge:
          "border-amber-400/60 bg-amber-950/45 text-amber-200 ring-1 ring-amber-400/40",
        xpPill:
          "bg-linear-to-br from-amber-400 to-yellow-600 text-amber-950 shadow-[0_0_16px_rgba(251,191,36,0.5)]",
        progressIncomplete: "bg-linear-to-r from-amber-500 to-yellow-500",
      };
  }
}

export interface RarityPickerPresentation {
  labelClass: string;
  iconClass: string;
  ambientGlowClass: string;
  titleClass: string;
  xpLineClass: string;
}

export function getRarityPickerPresentation(
  tier: MissionRarity,
  isSelected: boolean,
): RarityPickerPresentation {
  const baseLabel =
    "group relative flex min-h-[5.5rem] cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border px-2 py-3 text-center transition-all duration-300";

  if (isSelected) {
    switch (tier) {
      case "common":
        return {
          labelClass: `${baseLabel} border-slate-400/80 bg-slate-900/95 shadow-[0_0_32px_rgba(148,163,184,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] ring-2 ring-slate-400/45`,
          iconClass: "text-slate-100 drop-shadow-[0_0_12px_rgba(226,232,240,0.5)]",
          ambientGlowClass:
            "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(226,232,240,0.18)_0%,transparent_55%)] opacity-100",
          titleClass: "text-slate-50",
          xpLineClass: "text-slate-400",
        };
      case "rare":
        return {
          labelClass: `${baseLabel} border-cyan-400/85 bg-cyan-950/50 shadow-[0_0_36px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] ring-2 ring-cyan-400/55`,
          iconClass: "text-cyan-200 drop-shadow-[0_0_14px_rgba(34,211,238,0.75)]",
          ambientGlowClass:
            "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.28)_0%,transparent_60%)] opacity-100",
          titleClass: "text-cyan-50",
          xpLineClass: "text-cyan-200/85",
        };
      case "epic":
        return {
          labelClass: `${baseLabel} border-purple-400/85 bg-purple-950/45 shadow-[0_0_38px_rgba(168,85,247,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] ring-2 ring-purple-400/55`,
          iconClass: "text-purple-200 drop-shadow-[0_0_16px_rgba(192,132,252,0.65)]",
          ambientGlowClass:
            "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.3)_0%,transparent_58%)] opacity-100",
          titleClass: "text-purple-50",
          xpLineClass: "text-purple-200/85",
        };
      case "legendary":
        return {
          labelClass: `${baseLabel} border-amber-400/90 bg-amber-950/35 shadow-[0_0_42px_rgba(251,191,36,0.42),inset_0_1px_0_rgba(255,255,255,0.12)] ring-2 ring-amber-400/60`,
          iconClass: "text-amber-200 drop-shadow-[0_0_18px_rgba(251,191,36,0.75)]",
          ambientGlowClass:
            "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.28)_0%,transparent_55%)] opacity-100",
          titleClass: "text-amber-50",
          xpLineClass: "text-amber-200/90",
        };
    }
  }

  switch (tier) {
    case "common":
      return {
        labelClass: `${baseLabel} border-slate-800/90 bg-slate-950/90 hover:border-slate-500 hover:shadow-[0_0_22px_rgba(148,163,184,0.18)]`,
        iconClass: "text-slate-500 transition group-hover:text-slate-300",
        ambientGlowClass:
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(148,163,184,0.12)_0%,transparent_60%)] opacity-0 transition group-hover:opacity-100",
        titleClass: "text-slate-500 transition group-hover:text-slate-200",
        xpLineClass: "text-slate-600 transition group-hover:text-slate-500",
      };
    case "rare":
      return {
        labelClass: `${baseLabel} border-slate-800/90 bg-slate-950/90 hover:border-cyan-500/50 hover:shadow-[0_0_26px_rgba(34,211,238,0.22)]`,
        iconClass: "text-slate-600 transition group-hover:text-cyan-400/90",
        ambientGlowClass:
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.14)_0%,transparent_58%)] opacity-0 transition group-hover:opacity-100",
        titleClass: "text-slate-500 transition group-hover:text-cyan-200/90",
        xpLineClass: "text-slate-600 transition group-hover:text-cyan-500/80",
      };
    case "epic":
      return {
        labelClass: `${baseLabel} border-slate-800/90 bg-slate-950/90 hover:border-purple-500/55 hover:shadow-[0_0_28px_rgba(168,85,247,0.26)]`,
        iconClass: "text-slate-600 transition group-hover:text-purple-400/95",
        ambientGlowClass:
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.16)_0%,transparent_58%)] opacity-0 transition group-hover:opacity-100",
        titleClass: "text-slate-500 transition group-hover:text-purple-200/95",
        xpLineClass: "text-slate-600 transition group-hover:text-purple-400/75",
      };
    case "legendary":
      return {
        labelClass: `${baseLabel} border-slate-800/90 bg-slate-950/90 hover:border-amber-500/55 hover:shadow-[0_0_30px_rgba(251,191,36,0.24)]`,
        iconClass: "text-slate-600 transition group-hover:text-amber-400/95",
        ambientGlowClass:
          "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.14)_0%,transparent_55%)] opacity-0 transition group-hover:opacity-100",
        titleClass: "text-slate-500 transition group-hover:text-amber-200/95",
        xpLineClass: "text-slate-600 transition group-hover:text-amber-500/80",
      };
  }
}

export interface RarityBountyPanelPresentation {
  container: string;
  innerGlow: string;
  accentLine: string;
  valueClass: string;
  zapClass: string;
}

export function getRarityBountyPanelPresentation(
  rarity: MissionRarity,
): RarityBountyPanelPresentation {
  switch (rarity) {
    case "common":
      return {
        container:
          "relative overflow-hidden rounded-2xl border border-slate-600/70 bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 p-5 shadow-[0_0_40px_rgba(148,163,184,0.2)]",
        innerGlow:
          "pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-slate-400/15 blur-3xl",
        accentLine: "bg-linear-to-r from-transparent via-slate-400/50 to-transparent",
        valueClass: "font-cinzel text-4xl font-extrabold tracking-tight text-slate-50 drop-shadow-[0_0_24px_rgba(226,232,240,0.35)] md:text-5xl",
        zapClass: "text-slate-300 drop-shadow-[0_0_20px_rgba(226,232,240,0.35)]",
      };
    case "rare":
      return {
        container:
          "relative overflow-hidden rounded-2xl border border-cyan-500/55 bg-linear-to-br from-cyan-950/80 via-slate-950 to-slate-950 p-5 shadow-[0_0_48px_rgba(34,211,238,0.28)]",
        innerGlow:
          "pointer-events-none absolute -right-6 -top-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl",
        accentLine: "bg-linear-to-r from-transparent via-cyan-400/60 to-transparent",
        valueClass:
          "font-cinzel text-4xl font-extrabold tracking-tight text-cyan-100 drop-shadow-[0_0_28px_rgba(34,211,238,0.55)] md:text-5xl",
        zapClass: "text-cyan-300 drop-shadow-[0_0_22px_rgba(34,211,238,0.55)]",
      };
    case "epic":
      return {
        container:
          "relative overflow-hidden rounded-2xl border border-purple-500/55 bg-linear-to-br from-purple-950/70 via-slate-950 to-slate-950 p-5 shadow-[0_0_52px_rgba(168,85,247,0.32)]",
        innerGlow:
          "pointer-events-none absolute -right-6 -top-10 h-44 w-44 rounded-full bg-purple-500/25 blur-3xl",
        accentLine: "bg-linear-to-r from-transparent via-purple-400/55 to-transparent",
        valueClass:
          "font-cinzel text-4xl font-extrabold tracking-tight text-purple-100 drop-shadow-[0_0_30px_rgba(192,132,252,0.5)] md:text-5xl",
        zapClass: "text-purple-300 drop-shadow-[0_0_24px_rgba(168,85,247,0.55)]",
      };
    case "legendary":
      return {
        container:
          "relative overflow-hidden rounded-2xl border border-amber-400/60 bg-linear-to-br from-amber-950/50 via-slate-950 to-slate-950 p-5 shadow-[0_0_56px_rgba(251,191,36,0.35)]",
        innerGlow:
          "pointer-events-none absolute -right-4 -top-8 h-48 w-48 rounded-full bg-amber-400/22 blur-3xl",
        accentLine: "bg-linear-to-r from-transparent via-amber-400/65 to-transparent",
        valueClass:
          "font-cinzel text-4xl font-extrabold tracking-tight text-amber-100 drop-shadow-[0_0_32px_rgba(251,191,36,0.55)] md:text-5xl",
        zapClass: "text-amber-300 drop-shadow-[0_0_26px_rgba(251,191,36,0.6)]",
      };
  }
}

/** Ordered thresholds: highest matching `minLevel` wins. Extend by appending rows. */
export const RANK_TIER_IDS = [
  "forsaken",
  "sellsword",
  "shadow_blade",
  "dread_knight",
  "mythic_sovereign",
] as const;

export type RankTierId = (typeof RANK_TIER_IDS)[number];

export interface RankDefinition {
  readonly minLevel: number;
  readonly tierId: RankTierId;
  readonly titleEn: string;
  readonly titleEs: string;
}

export const RANK_DEFINITIONS: readonly RankDefinition[] = [
  { minLevel: 1, tierId: "forsaken", titleEn: "The Forsaken", titleEs: "El Abandonado" },
  { minLevel: 6, tierId: "sellsword", titleEn: "Sellsword", titleEs: "Mercenario" },
  { minLevel: 13, tierId: "shadow_blade", titleEn: "Shadow Blade", titleEs: "Hoja Sombría" },
  { minLevel: 21, tierId: "dread_knight", titleEn: "Dread Knight", titleEs: "Caballero del Pavor" },
  { minLevel: 36, tierId: "mythic_sovereign", titleEn: "Mythic Sovereign", titleEs: "Soberano Mítico" },
];

export interface PlayerRank extends RankDefinition {
  readonly tierIndex: number;
}

function normalizeLevel(level: number): number {
  if (!Number.isFinite(level)) return 1;
  return Math.max(1, Math.floor(level));
}

/** Narrative rank for UI and rewards — derived only from level. */
export function getRankForLevel(level: number): PlayerRank {
  const lv = normalizeLevel(level);
  let chosen: RankDefinition = RANK_DEFINITIONS[0];
  for (const def of RANK_DEFINITIONS) {
    if (lv >= def.minLevel) chosen = def;
    else break;
  }
  const tierIndex = RANK_TIER_IDS.indexOf(chosen.tierId);
  return {
    ...chosen,
    tierIndex: tierIndex >= 0 ? tierIndex : 0,
  };
}

export function getRankTierId(level: number): RankTierId {
  return getRankForLevel(level).tierId;
}

/**
 * Base Void Credits (Oro del Vacío) per rarity — contract payout before rank multiplier.
 * Keep in sync with mission seal rewards in the economy layer.
 */
export const RARITY_VOID_CREDITS_BASE: Record<MissionRarity, number> = {
  common: 2,
  rare: 5,
  epic: 12,
  legendary: 25,
};

/**
 * Higher narrative rank unlocks better-paid contracts (same rarity pays more).
 */
export const RANK_VOID_CREDIT_MULTIPLIER: Record<RankTierId, number> = {
  forsaken: 1,
  sellsword: 1.15,
  shadow_blade: 1.35,
  dread_knight: 1.55,
  mythic_sovereign: 1.85,
};

/** Credits earned when a mission is sealed: floor(Base_Rareza × Multiplicador_Rango). */
export function getVoidCreditsForMissionSeal(
  rarity: MissionRarity,
  level: number,
): number {
  const base = RARITY_VOID_CREDITS_BASE[rarity];
  const tierId = getRankTierId(level);
  const mult = RANK_VOID_CREDIT_MULTIPLIER[tierId];
  const raw = base * mult;
  return Math.max(1, Math.floor(Number.isFinite(raw) ? raw : base));
}

export interface RankTitlePresentation {
  englishClass: string;
  spanishClass: string;
}

/** Tailwind classes: low tiers muted slate → mid cyan → apex gold. */
export function getRankTitlePresentation(tierIndex: number): RankTitlePresentation {
  const idx = Math.min(Math.max(0, tierIndex), RANK_TIER_IDS.length - 1);
  switch (idx) {
    case 0:
      return {
        englishClass: "text-slate-500",
        spanishClass: "text-slate-600",
      };
    case 1:
      return {
        englishClass:
          "text-slate-400 drop-shadow-[0_0_10px_rgba(148,163,184,0.35)]",
        spanishClass: "text-slate-500",
      };
    case 2:
      return {
        englishClass:
          "text-cyan-500/95 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]",
        spanishClass: "text-cyan-600/85",
      };
    case 3:
      return {
        englishClass:
          "text-cyan-300 drop-shadow-[0_0_16px_rgba(34,211,238,0.55)]",
        spanishClass: "text-cyan-400/90",
      };
    case 4:
    default:
      return {
        englishClass:
          "text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.55)]",
        spanishClass: "text-amber-400/95",
      };
  }
}

/** User streak fields — keep in sync with future Supabase profile columns. */
export interface UserStreakFields {
  currentStreak: number;
  /** ISO 8601 timestamp of the last sealed mission, or null if never. */
  lastCompletionDate: string | null;
}

const MS_PER_HOUR = 60 * 60 * 1000;

function localCalendarParts(d: Date): { y: number; m: number; day: number } {
  return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() };
}

/** Same local calendar day (browser / server local timezone). */
export function isSameLocalCalendarDay(a: Date, b: Date): boolean {
  const pa = localCalendarParts(a);
  const pb = localCalendarParts(b);
  return pa.y === pb.y && pa.m === pb.m && pa.day === pb.day;
}

export function hoursBetweenEarlierAndLater(earlier: Date, later: Date): number {
  return (later.getTime() - earlier.getTime()) / MS_PER_HOUR;
}

/**
 * On app load: if last completion was more than 48 hours ago, streak is lost (0).
 * Does not change `lastCompletionDate`.
 */
export function applyStreakOnAppOpen(
  fields: UserStreakFields,
  now: Date,
): UserStreakFields {
  const { lastCompletionDate, currentStreak } = fields;
  if (!lastCompletionDate || currentStreak <= 0) {
    return fields;
  }
  const last = new Date(lastCompletionDate);
  if (Number.isNaN(last.getTime())) {
    return { ...fields, currentStreak: 0 };
  }
  const hoursSince = hoursBetweenEarlierAndLater(last, now);
  if (hoursSince > 48) {
    return { ...fields, currentStreak: 0 };
  }
  return fields;
}

export interface StreakSealResult {
  next: UserStreakFields;
  /** First seal of the local calendar day (streak rules ran; not a same-day repeat seal). */
  isFirstSealOfLocalDay: boolean;
  /** Streak value after this seal (for celebration copy). */
  newStreak: number;
}

/**
 * When a mission is sealed: updates streak and `lastCompletionDate` to `now`.
 * - Same local day as last completion: streak unchanged.
 * - First seal of the day: if no last date or >24h since last → streak = 1; else streak += 1.
 */
export function computeStreakAfterMissionSeal(
  fields: UserStreakFields,
  now: Date,
): StreakSealResult {
  const { lastCompletionDate, currentStreak } = fields;
  const safeStreak = Number.isFinite(currentStreak) ? Math.max(0, Math.floor(currentStreak)) : 0;

  if (lastCompletionDate) {
    const last = new Date(lastCompletionDate);
    if (!Number.isNaN(last.getTime()) && isSameLocalCalendarDay(last, now)) {
      return {
        next: {
          currentStreak: safeStreak,
          lastCompletionDate: now.toISOString(),
        },
        isFirstSealOfLocalDay: false,
        newStreak: safeStreak,
      };
    }
  }

  let newStreak: number;
  if (!lastCompletionDate) {
    newStreak = 1;
  } else {
    const last = new Date(lastCompletionDate);
    if (Number.isNaN(last.getTime())) {
      newStreak = 1;
    } else {
      const hoursSince = hoursBetweenEarlierAndLater(last, now);
      newStreak = hoursSince > 24 ? 1 : safeStreak + 1;
    }
  }

  return {
    next: {
      currentStreak: newStreak,
      lastCompletionDate: now.toISOString(),
    },
    isFirstSealOfLocalDay: true,
    newStreak,
  };
}

/** True when the user has an active streak (>0) but has not sealed anything today (local day). */
export function isStreakAtRisk(fields: UserStreakFields, now: Date): boolean {
  const { currentStreak, lastCompletionDate } = fields;
  if (currentStreak <= 0 || !lastCompletionDate) return false;
  const last = new Date(lastCompletionDate);
  if (Number.isNaN(last.getTime())) return false;
  return !isSameLocalCalendarDay(last, now);
}

/** Scroll of Focus — one Pomodoro block (ms). */
export const SCROLL_FOCUS_DURATION_MS = 25 * 60 * 1000;

/** Chain window: start a new scroll within this after the previous block ended to raise combo. */
export const SCROLL_FOCUS_COMBO_CHAIN_MS = 5 * 60 * 1000;

/** Base Void Credits (Oro del Vacío) when a focus block completes naturally. */
export const SCROLL_FOCUS_SESSION_BASE_GOLD = 5;

/** Void Credits lost when the player extinguishes an active Scroll (clamped; no debt below 0). */
export const SCROLL_FOCUS_ABANDON_PENALTY_VOID = 10;

/** Extra XP and seal Void Credits when sealing while the scroll timer is still running on that mission. */
export const FOCUS_SEAL_REWARD_MULTIPLIER = 1.25;

const MAX_FOCUS_COMBO_TIER = 40;

/**
 * Combo tier 0 → ×1.0, tier 1 → ×1.1, tier 2 → ×1.2, etc.
 * Used for end-of-block focus gold only.
 */
export function getFocusComboGoldMultiplier(comboTier: number): number {
  const t = Math.min(
    MAX_FOCUS_COMBO_TIER,
    Math.max(0, Math.floor(Number.isFinite(comboTier) ? comboTier : 0)),
  );
  return 1 + 0.1 * t;
}

/** Void Credits granted when a 25m focus block completes (floored). */
export function getScrollFocusSessionGold(comboTier: number): number {
  const raw = SCROLL_FOCUS_SESSION_BASE_GOLD * getFocusComboGoldMultiplier(comboTier);
  return Math.max(1, Math.floor(Number.isFinite(raw) ? raw : SCROLL_FOCUS_SESSION_BASE_GOLD));
}

/**
 * Next combo tier when starting a scroll: +1 if previous block ended within chain window, else 0.
 */
export function computeScrollFocusComboTierOnActivate(
  nowMs: number,
  lastBlockEndedAtMs: number | null,
  lastBlockComboTier: number,
): number {
  if (
    lastBlockEndedAtMs === null ||
    !Number.isFinite(lastBlockEndedAtMs) ||
    nowMs - lastBlockEndedAtMs > SCROLL_FOCUS_COMBO_CHAIN_MS
  ) {
    return 0;
  }
  const prev = Math.max(
    0,
    Math.floor(Number.isFinite(lastBlockComboTier) ? lastBlockComboTier : 0),
  );
  return Math.min(MAX_FOCUS_COMBO_TIER, prev + 1);
}
