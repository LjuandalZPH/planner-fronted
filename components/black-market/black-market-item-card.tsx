"use client";

import { useState } from "react";
import { Stamp, Trash2, Coins } from "lucide-react";
import { useEconomy } from "@/context/economy-context";
import { BlackMarketGlyph } from "@/lib/black-market-icons";
import type { BlackMarketItem } from "@/types/black-market";
import { formatVoidCredits } from "@/lib/utils";
import { BLACK_MARKET_BURST_OFFSETS } from "./burst-offsets";

interface BlackMarketItemCardProps {
  item: BlackMarketItem;
}

export function BlackMarketItemCard({ item }: BlackMarketItemCardProps) {
  const { voidCredits, purchaseItem, removeUserItem } = useEconomy();
  const [fxPhase, setFxPhase] = useState<"idle" | "burst" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const redeemed = item.redeemedAt !== null;
  const affordable = voidCredits >= item.costCredits;
  const locked = !redeemed && !affordable;

  async function handlePurchase() {
    if (redeemed || locked || fxPhase !== "idle") return;
    setError(null);
    setFxPhase("burst");
    await new Promise((r) => setTimeout(r, 820));
    const res = purchaseItem(item.id);
    if (!res.success) {
      setFxPhase("idle");
      setError(res.error ?? "Transaction failed");
      return;
    }
    setFxPhase("done");
    window.setTimeout(() => setFxPhase("idle"), 2400);
  }

  function handleRemove() {
    if (item.source !== "user") return;
    removeUserItem(item.id);
  }

  return (
    <article
      className={`group relative flex min-h-[280px] flex-col overflow-hidden rounded-sm border-2 bg-linear-to-b from-amber-950/35 via-slate-950 to-slate-950 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.85)] transition-all duration-500 ${
        redeemed
          ? "border-emerald-600/50 opacity-95"
          : locked
            ? "border-slate-800/90 opacity-55 saturate-[0.35]"
            : "border-amber-600/40 shadow-[0_0_36px_rgba(245,158,11,0.12)] hover:-translate-y-0.5 hover:border-amber-400/55 hover:shadow-[0_0_48px_rgba(251,191,36,0.22)]"
      } ${fxPhase === "burst" || fxPhase === "done" ? "ring-2 ring-amber-400/70" : ""}`}
    >
      {/* Parchment texture bands */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(251,191,36,0.35) 2px, rgba(251,191,36,0.35) 3px)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(251,191,36,0.12)_0%,transparent_55%)]" />

      {/* Gold wash on purchase */}
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(250,204,21,0.55)_0%,transparent_60%)] transition-opacity duration-300 ${
          fxPhase === "burst" || fxPhase === "done" ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />

      {/* Particle burst */}
      {fxPhase === "burst" || fxPhase === "done" ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {BLACK_MARKET_BURST_OFFSETS.map((o, i) => (
            <span
              key={i}
              className="void-particle h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.95)]"
              style={
                {
                  ["--tx" as string]: `${o.tx}px`,
                  ["--ty" as string]: `${o.ty}px`,
                } as Record<string, string>
              }
            />
          ))}
        </div>
      ) : null}

      <div className="relative flex flex-1 flex-col p-5 pt-6">
        {/* Scroll top curl */}
        <div className="pointer-events-none absolute -top-1 left-4 right-4 h-3 rounded-b-md bg-linear-to-b from-amber-200/25 to-transparent blur-[2px]" />

        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-md border bg-slate-950/80 shadow-inner ${
              locked
                ? "border-slate-700 text-slate-600"
                : "border-amber-500/40 text-amber-200 drop-shadow-[0_0_14px_rgba(251,191,36,0.45)]"
            }`}
          >
            <BlackMarketGlyph id={item.iconId} size={28} aria-hidden />
          </div>

          {item.source === "user" && !redeemed ? (
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-md border border-slate-800/80 p-2 text-slate-500 transition hover:border-red-500/50 hover:text-red-400"
              aria-label="Remove listing"
            >
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>

        <h3
          className={`font-cinzel mb-2 line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-snug tracking-tight ${
            redeemed ? "text-emerald-100" : locked ? "text-slate-500" : "text-amber-50"
          }`}
        >
          {item.name}
        </h3>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-950/50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-200/95">
            <Coins size={13} className="text-amber-400" aria-hidden />
            {formatVoidCredits(item.costCredits)} Void
          </span>
          {item.source === "catalog" ? (
            <span className="rounded-full border border-purple-500/30 bg-purple-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-200/90">
              Curated
            </span>
          ) : (
            <span className="rounded-full border border-slate-700/80 bg-slate-900/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Your ink
            </span>
          )}
        </div>

        <div className="mt-auto space-y-3 border-t border-amber-900/25 pt-4">
          {error ? (
            <p className="text-center text-xs font-medium text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {redeemed ? (
            <div className="void-stamp relative flex flex-col items-center gap-2 py-2">
              <div className="flex items-center gap-2 rounded-md border-2 border-dashed border-emerald-500/60 bg-emerald-950/40 px-4 py-2 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                <Stamp size={20} className="text-emerald-400" aria-hidden />
                <span className="font-cinzel text-sm font-extrabold uppercase tracking-[0.25em] text-emerald-200">
                  Redeemed
                </span>
              </div>
              <p className="text-center text-[11px] text-slate-500">
                The pact is sealed. Claim your reward in the physical realm.
              </p>
            </div>
          ) : (
            <button
              type="button"
              disabled={locked || fxPhase !== "idle"}
              onClick={handlePurchase}
              className={`relative w-full overflow-hidden rounded-md px-4 py-3 font-cinzel text-sm font-extrabold uppercase tracking-[0.2em] transition ${
                locked
                  ? "cursor-not-allowed border border-slate-800 bg-slate-900/80 text-slate-600"
                  : "border border-amber-500/50 bg-linear-to-b from-amber-500 via-amber-600 to-amber-800 text-amber-950 shadow-[0_0_28px_rgba(251,191,36,0.35)] hover:from-amber-400 hover:via-amber-500 hover:to-amber-700"
              } ${fxPhase === "burst" ? "void-purchase-shake" : ""}`}
            >
              <span className="relative z-10">
                {locked ? "Insufficient Tribute" : "Seal the Deal"}
              </span>
              {!locked ? (
                <span
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.35)_45%,transparent_90%)] opacity-0 transition duration-700 group-hover:translate-x-full group-hover:opacity-100"
                  aria-hidden
                />
              ) : null}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
