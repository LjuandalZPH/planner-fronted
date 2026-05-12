"use client";

import { useState, type FormEvent } from "react";
import { useEconomy } from "@/context/economy-context";
import {
  BLACK_MARKET_ICON_IDS,
  type BlackMarketIconId,
} from "@/types/black-market";
import { BlackMarketGlyph } from "@/lib/black-market-icons";

interface BlackMarketItemFormProps {
  onDone: () => void;
}

export function BlackMarketItemForm({ onDone }: BlackMarketItemFormProps) {
  const { addUserItem } = useEconomy();
  const [name, setName] = useState("");
  const [cost, setCost] = useState("12");
  const [iconId, setIconId] = useState<BlackMarketIconId>("scroll");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = addUserItem({
      name,
      costCredits: Number(cost),
      iconId,
    });
    if (!res.success) {
      setError(res.error ?? "Could not inscribe listing");
      return;
    }
    setName("");
    setCost("12");
    setIconId("scroll");
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <p className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <div>
        <label htmlFor="bm-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Reward name
        </label>
        <input
          id="bm-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. 15 min rest, special dinner…"
          maxLength={80}
          required
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="bm-cost" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Cost (Void Credits)
        </label>
        <input
          id="bm-cost"
          type="number"
          min={1}
          step={1}
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
        />
      </div>

      <fieldset>
        <legend className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Sigil
        </legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {BLACK_MARKET_ICON_IDS.map((id) => {
            const selected = iconId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setIconId(id)}
                className={`flex h-12 items-center justify-center rounded-lg border transition ${
                  selected
                    ? "border-amber-400/70 bg-amber-950/50 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.35)]"
                    : "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                }`}
                aria-pressed={selected}
                aria-label={`Icon ${id}`}
              >
                <BlackMarketGlyph id={id} size={22} aria-hidden />
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          className="flex-1 rounded-lg border border-amber-500/50 bg-linear-to-b from-amber-500 to-amber-700 px-4 py-3 font-cinzel text-sm font-extrabold uppercase tracking-widest text-amber-950 shadow-[0_0_22px_rgba(251,191,36,0.25)] transition hover:from-amber-400 hover:to-amber-600"
        >
          Inscribe listing
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
