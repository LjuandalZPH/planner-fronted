"use client";

import type { User } from "@supabase/supabase-js";
import { Coins, LogOut, Shield, Sparkles } from "lucide-react";
import { getRankForLevel } from "@/lib/gamification";
import { formatVoidCredits } from "@/lib/utils";

interface TheSanctumProps {
  user: User;
  level: number;
  voidCredits: number;
  onSignOut: () => void;
}

export function TheSanctum({
  user,
  level,
  voidCredits,
  onSignOut,
}: TheSanctumProps) {
  const metadata = user.user_metadata ?? {};
  const displayName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : user.email ?? "Unknown Wanderer";
  const avatarUrl =
    typeof metadata.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata.picture === "string"
        ? metadata.picture
        : null;
  const rank = getRankForLevel(level);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-linear-to-br from-slate-900 via-slate-950 to-purple-950/30 p-5 shadow-[0_0_34px_rgba(168,85,247,0.18)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.16)_0%,transparent_56%)]" aria-hidden />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400/40 bg-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.22)]">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Shield className="h-7 w-7 text-cyan-200" aria-hidden />
            )}
          </div>

          <div className="min-w-0">
            <p className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-cyan-500/25 bg-cyan-950/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
              <Sparkles size={12} aria-hidden />
              The Sanctum
            </p>
            <h2 className="truncate font-cinzel text-xl font-extrabold text-slate-50">
              {displayName}
            </h2>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:min-w-[24rem]">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Level</p>
            <p className="font-cinzel text-lg font-extrabold text-yellow-300">{level}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Rank</p>
            <p className="truncate font-cinzel text-sm font-bold text-cyan-200">{rank.titleEn}</p>
          </div>
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-center">
            <p className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-widest text-amber-500/90">
              <Coins size={12} aria-hidden />
              Void
            </p>
            <p className="font-cinzel text-lg font-extrabold text-amber-100">
              {formatVoidCredits(voidCredits)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/35 bg-red-950/25 px-4 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.16em] text-red-100 transition hover:border-red-400/60 hover:bg-red-950/45"
        >
          <LogOut size={16} aria-hidden />
          Sign Out
        </button>
      </div>
    </section>
  );
}
