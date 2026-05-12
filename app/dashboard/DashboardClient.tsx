"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MissionForm } from "@/components/mission/MissionForm";
import { MissionList } from "@/components/mission/MissionList";
import { HeroProfile } from "@/components/gamification/HeroProfile";
import { TheSanctum } from "@/components/gamification/TheSanctum";
import { BlackMarketPanel } from "@/components/black-market/black-market-panel";
import { BlackMarketItemForm } from "@/components/black-market/black-market-item-form";
import { Modal } from "@/components/ui/modal";
import { FAB } from "@/components/ui/fab";
import { useMissions } from "@/hooks/useMissions";
import { useStreak } from "@/hooks/useStreak";
import { useXP } from "@/hooks/useXP";
import { useAuth } from "@/hooks/useAuth";
import { EconomyProvider, useEconomy } from "@/context/economy-context";
import { ScrollFocusProvider, useScrollFocus } from "@/context/scroll-focus-context";
import {
  getXpForRarity,
  getRankTierId,
  getVoidCreditsForMissionSeal,
  isStreakAtRisk,
  FOCUS_SEAL_REWARD_MULTIPLIER,
  RARITY_VOID_CREDITS_BASE,
  type MissionRarity,
} from "@/lib/gamification";
import { Scroll, Flame, LayoutGrid, Store, CircleSlash } from "lucide-react";
import type { User } from "@supabase/supabase-js";

function DashboardShell({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const view = searchParams.get("view") === "market" ? "market" : "board";

  const { missions, addMission, completeMission, deleteMission } = useMissions();
  const { xp, level, nextLevelXP, gainXP, setProgress } = useXP();
  const { streak, registerMissionSeal } = useStreak();
  const { displayVoidCredits, setVoidCreditsBalance } = useEconomy();
  const scrollFocus = useScrollFocus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [relicModalOpen, setRelicModalOpen] = useState(false);
  const [greatSealModalOpen, setGreatSealModalOpen] = useState(false);
  const [focusAbandonToast, setFocusAbandonToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [rankUpActive, setRankUpActive] = useState(false);
  const [streakCelebrationDays, setStreakCelebrationDays] = useState<number | null>(
    null,
  );
  const sealInFlightRef = useRef<Set<string>>(new Set());
  const prevLevelRef = useRef(level);
  const abandonSeenTickRef = useRef(0);

  useEffect(() => {
    if (view !== "market") {
      setRelicModalOpen(false);
    }
  }, [view]);

  useEffect(() => {
    const prev = prevLevelRef.current;
    if (level > prev && getRankTierId(prev) !== getRankTierId(level)) {
      setRankUpActive(true);
      const id = window.setTimeout(() => setRankUpActive(false), 4500);
      prevLevelRef.current = level;
      return () => window.clearTimeout(id);
    }
    prevLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    if (!greatSealModalOpen) return;
    const id = window.setTimeout(() => setGreatSealModalOpen(false), 5200);
    return () => window.clearTimeout(id);
  }, [greatSealModalOpen]);

  useEffect(() => {
    const tick = scrollFocus.abandonBannerTick;
    if (tick === abandonSeenTickRef.current) return;
    abandonSeenTickRef.current = tick;
    if (tick > 0) {
      setFocusAbandonToast(true);
    }
  }, [scrollFocus.abandonBannerTick]);

  useEffect(() => {
    if (!focusAbandonToast) return;
    const id = window.setTimeout(() => setFocusAbandonToast(false), 5200);
    return () => window.clearTimeout(id);
  }, [focusAbandonToast]);

  function setView(next: "board" | "market") {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "board") {
      params.delete("view");
    } else {
      params.set("view", "market");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleCreateMission(data: {
    title: string;
    description: string;
    rarity: MissionRarity;
  }) {
    setIsSubmitting(true);
    addMission(data);
    const tierXp = getXpForRarity(data.rarity);
    gainXP(Math.floor(tierXp * 0.1));
    setIsSubmitting(false);
    setIsModalOpen(false);
  }

  async function handleCompleteMission(id: string) {
    const mission = missions.find((m) => m.id === id);
    if (!mission || mission.progress >= 100) return;
    if (sealInFlightRef.current.has(id)) return;

    const rewardRarity = mission.rarity;
    const levelAtSeal = level;
    const baseCredits = getVoidCreditsForMissionSeal(rewardRarity, levelAtSeal);
    const greatFocusSeal = scrollFocus.isGreatSealActiveForMission(id);
    const rewardMult = greatFocusSeal ? FOCUS_SEAL_REWARD_MULTIPLIER : 1;
    const xpGain = Math.floor(getXpForRarity(rewardRarity) * rewardMult);
    const creditsEarned = Math.max(1, Math.floor(baseCredits * rewardMult));
    sealInFlightRef.current.add(id);
    setCompletingId(id);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const sealResult = await completeMission(id, {
        xpMultiplier: rewardMult,
        voidMultiplier:
          creditsEarned / Math.max(1, RARITY_VOID_CREDITS_BASE[rewardRarity]),
      });
      if (sealResult.success && sealResult.data) {
        setProgress(sealResult.data.profile);
        setVoidCreditsBalance(sealResult.data.profile.voidCredits);
      } else {
        gainXP(xpGain);
      }
      if (greatFocusSeal) {
        setGreatSealModalOpen(true);
      }
      const celebration = registerMissionSeal(new Date());
      if (celebration !== null) {
        setStreakCelebrationDays(celebration);
        window.setTimeout(() => setStreakCelebrationDays(null), 4200);
      }
    } finally {
      scrollFocus.clearScroll();
      sealInFlightRef.current.delete(id);
      setCompletingId(null);
    }
  }

  function handleDeleteMission(id: string) {
    if (scrollFocus.activeSession?.missionId === id) {
      scrollFocus.clearScroll();
    }
    deleteMission(id);
  }

  const completedCount = missions.filter((m) => m.progress >= 100).length;
  const pendingCount = missions.filter((m) => m.progress < 100).length;
  const streakAtRisk = isStreakAtRisk(streak, new Date());

  return (
    <div className="relative min-h-screen bg-slate-950">
      {streakCelebrationDays !== null ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 top-4 z-50 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-orange-500/45 bg-linear-to-r from-orange-950/95 via-slate-950/98 to-amber-950/40 px-4 py-3 text-center shadow-[0_0_32px_rgba(249,115,22,0.35)]"
        >
          <p className="flex items-center justify-center gap-2 font-cinzel text-sm font-semibold text-orange-100 drop-shadow-[0_0_12px_rgba(251,146,60,0.45)]">
            <Flame size={18} className="shrink-0 text-orange-400" aria-hidden />
            ¡Racha de {streakCelebrationDays}{" "}
            {streakCelebrationDays === 1 ? "día" : "días"} mantenida!
          </p>
        </div>
      ) : null}

      {focusAbandonToast ? (
        <div
          role="alert"
          aria-live="assertive"
          className="pointer-events-none fixed left-1/2 top-[5.25rem] z-50 w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-red-500/50 bg-linear-to-r from-red-950/95 via-slate-950/98 to-red-950/40 px-4 py-3 text-center shadow-[0_0_36px_rgba(239,68,68,0.35)]"
        >
          <p className="flex items-start justify-center gap-2 font-cinzel text-sm font-semibold leading-snug text-red-100 drop-shadow-[0_0_12px_rgba(248,113,113,0.4)]">
            <CircleSlash size={18} className="mt-0.5 shrink-0 text-red-400" aria-hidden />
            <span>
              El pergamino se ha consumido en cenizas. Voto de enfoque roto.
            </span>
          </p>
        </div>
      ) : null}

      <div
        className="pointer-events-none fixed inset-0 z-0 transition-[background-image] duration-500"
        aria-hidden
        style={{
          backgroundImage:
            view === "market"
              ? `
              radial-gradient(ellipse 130% 90% at 50% -8%, rgba(251, 191, 36, 0.11), transparent 52%),
              radial-gradient(ellipse 100% 70% at 100% 32%, rgba(168, 85, 247, 0.08), transparent 48%),
              radial-gradient(ellipse 100% 70% at 0% 58%, rgba(245, 158, 11, 0.07), transparent 48%),
              radial-gradient(ellipse 90% 55% at 50% 100%, rgba(2, 6, 23, 0.85), transparent 55%)
            `
              : `radial-gradient(ellipse 100% 60% at 50% -10%, rgba(168, 85, 247, 0.09), transparent 50%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <TheSanctum
            user={user}
            level={level}
            voidCredits={displayVoidCredits}
            onSignOut={onSignOut}
          />
        </div>

        <nav
          className="relative z-20 mb-8 flex flex-wrap items-center justify-center gap-3"
          aria-label="Primary"
        >
          <button
            type="button"
            onClick={() => setView("board")}
            className={`inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-xl border px-5 py-3 font-cinzel text-xs font-extrabold uppercase tracking-[0.18em] transition-all duration-500 ${
              view === "board"
                ? "border-cyan-500/50 bg-linear-to-b from-slate-900 to-slate-950 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.22)]"
                : "border-slate-800 bg-slate-950/80 text-slate-500 hover:border-slate-600 hover:text-slate-300"
            }`}
          >
            <LayoutGrid size={18} aria-hidden />
            Mission Board
          </button>
          <button
            type="button"
            onClick={() => setView("market")}
            className={`inline-flex min-w-[10rem] items-center justify-center gap-2 rounded-xl border px-5 py-3 font-cinzel text-xs font-extrabold uppercase tracking-[0.18em] transition-all duration-500 ${
              view === "market"
                ? "border-amber-500/50 bg-linear-to-b from-amber-950/50 to-slate-950 text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.22)]"
                : "border-slate-800 bg-slate-950/80 text-slate-500 hover:border-slate-600 hover:text-slate-300"
            }`}
          >
            <Store size={18} aria-hidden />
            The Black Market
          </button>
        </nav>

        <div className="relative">
          {view === "board" ? (
            <div key="board" className="dashboard-view-enter space-y-8">
              <header className="text-center">
                <h1 className="font-cinzel mb-2 text-3xl font-extrabold text-slate-50 md:text-4xl lg:text-5xl drop-shadow-[0_0_40px_rgba(168,85,247,0.3)]">
                  Mission Board
                </h1>
                <p className="flex items-center justify-center gap-2 text-slate-500">
                  <Scroll size={16} className="text-purple-500" />
                  Accept contracts and seal your destiny
                </p>
              </header>

              <div className="grid gap-6">
                <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
                  <aside className="lg:sticky lg:top-6">
                    <HeroProfile
                      level={level}
                      xp={xp}
                      nextLevelXP={nextLevelXP}
                      totalMissions={missions.length}
                      completedMissions={completedCount}
                      rankUpActive={rankUpActive}
                      currentStreak={streak.currentStreak}
                      streakAtRisk={streakAtRisk}
                      voidCreditsDisplay={displayVoidCredits}
                    />
                  </aside>

                  <main>
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="font-cinzel text-xl font-semibold text-slate-50">
                        Active Contracts
                      </h2>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-500">
                        {pendingCount} pending
                      </span>
                    </div>

                    <MissionList
                      missions={missions}
                      onComplete={handleCompleteMission}
                      onDelete={handleDeleteMission}
                      completingId={completingId}
                      playerLevel={level}
                    />
                  </main>
                </div>
              </div>
            </div>
          ) : (
            <div key="market" className="dashboard-view-enter">
              <BlackMarketPanel onOpenDraftRelic={() => setRelicModalOpen(true)} />
            </div>
          )}
        </div>
      </div>

      {view === "board" ? <FAB onClick={() => setIsModalOpen(true)} /> : null}

      <Modal
        isOpen={relicModalOpen}
        onClose={() => setRelicModalOpen(false)}
        title="Draft a relic"
        tone="amber"
      >
        <BlackMarketItemForm
          onDone={() => {
            setRelicModalOpen(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Accept New Contract"
        dialogClassName="max-w-[min(92vw,56rem)]"
      >
        <MissionForm
          playerLevel={level}
          onSubmit={handleCreateMission}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={greatSealModalOpen}
        onClose={() => setGreatSealModalOpen(false)}
        title="¡Contrato Sellado con Enfoque Superior!"
        dialogClassName="max-w-md"
      >
        <p className="text-center font-cinzel text-sm leading-relaxed text-cyan-100/95">
          Bonus de +25% obtenido en XP y Oro del Vacío.
        </p>
        <p className="mt-3 text-center text-xs text-slate-500">
          El pergamino de enfoque amplificó tu recompensa al sellar con disciplina.
        </p>
      </Modal>
    </div>
  );
}

export function DashboardClient() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  if (isLoading || !user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08)_0%,transparent_52%)]"
        aria-busy="true"
        aria-label="Loading dashboard"
      >
        <div className="rounded-2xl border border-cyan-500/25 bg-slate-900/80 px-6 py-4 font-cinzel text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
          Opening the Mission Board...
        </div>
      </div>
    );
  }

  return (
    <EconomyProvider>
      <ScrollFocusProvider>
        <Suspense
          fallback={
            <div className="min-h-screen bg-slate-950" aria-busy="true" aria-label="Loading" />
          }
        >
          <DashboardShell user={user} onSignOut={() => void handleSignOut()} />
        </Suspense>
      </ScrollFocusProvider>
    </EconomyProvider>
  );
}
