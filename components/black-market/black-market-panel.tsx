"use client";

import { Coins, Eye, Skull, Sparkles } from "lucide-react";
import { useEconomy } from "@/context/economy-context";
import { BlackMarketItemCard } from "@/components/black-market/black-market-item-card";
import { formatVoidCredits } from "@/lib/utils";

interface BlackMarketPanelProps {
  /** Open the draft modal at the dashboard root (portal) — same pattern as new mission. */
  onOpenDraftRelic: () => void;
}

export function BlackMarketPanel({ onOpenDraftRelic }: BlackMarketPanelProps) {
  const { displayVoidCredits, items } = useEconomy();

  return (
    <div className="relative pb-10">
      <header className="relative z-10 mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-950/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-200/90 shadow-[0_0_24px_rgba(245,158,11,0.2)]">
          <Skull size={14} className="text-amber-400" aria-hidden />
          Off the books
        </div>
        <h1 className="font-cinzel mb-3 text-3xl font-extrabold tracking-tight text-amber-50 drop-shadow-[0_0_36px_rgba(251,191,36,0.25)] md:text-4xl lg:text-5xl">
          The Black Market
        </h1>
        <p className="mx-auto flex max-w-xl items-center justify-center gap-2 text-sm text-slate-500">
          <Eye size={16} className="shrink-0 text-amber-500/80" aria-hidden />
          Trade sealed fate for tangible pleasures — prices are written in Void Credits.
        </p>
      </header>

      {/* Balance strip: full width feel, no “orange box” card */}
      <div className="relative z-10 mx-auto mb-12 flex max-w-3xl flex-col gap-5 border-y border-amber-500/10 bg-slate-950/25 py-7 backdrop-blur-[2px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-6">
        <div className="flex items-center gap-3 px-1 sm:px-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-slate-950/80 shadow-[0_0_20px_rgba(251,191,36,0.18)]">
            <Coins size={22} className="text-amber-300" aria-hidden />
          </div>
          <div>
            <p className="font-cinzel text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-500/90">
              Void Credits
            </p>
            <p
              className="font-cinzel text-3xl font-extrabold tabular-nums text-amber-100 drop-shadow-[0_0_18px_rgba(251,191,36,0.35)]"
              aria-live="polite"
            >
              {formatVoidCredits(displayVoidCredits)}
            </p>
            <p className="text-[11px] text-slate-500">Also known as Oro del Vacío</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDraftRelic}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-stretch rounded-xl border border-amber-500/45 bg-linear-to-b from-amber-600/90 to-amber-900 px-5 py-3 font-cinzel text-xs font-extrabold uppercase tracking-[0.2em] text-amber-50 shadow-[0_0_28px_rgba(251,191,36,0.2)] transition hover:from-amber-500 hover:to-amber-800 sm:self-center"
        >
          <Sparkles size={16} aria-hidden />
          Draft new relic
        </button>
      </div>

      {items.length === 0 ? (
        <div className="relative z-10 mx-auto max-w-lg rounded-2xl border border-dashed border-slate-800/90 bg-slate-950/40 px-8 py-14 text-center">
          <p className="font-cinzel mb-2 text-lg font-semibold text-slate-200">No relics yet</p>
          <p className="text-sm text-slate-500">
            Inscribe your first real-life reward. Each card becomes a binding contract with yourself.
          </p>
        </div>
      ) : (
        <div className="relative z-10 mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <BlackMarketItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
