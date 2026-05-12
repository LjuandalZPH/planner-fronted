"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useEconomy } from "@/context/economy-context";
import {
  SCROLL_FOCUS_ABANDON_PENALTY_VOID,
  SCROLL_FOCUS_DURATION_MS,
  computeScrollFocusComboTierOnActivate,
  getScrollFocusSessionGold,
} from "@/lib/gamification";

export interface ActiveScrollSession {
  missionId: string;
  deadlineMs: number;
  startedAtMs: number;
  comboTier: number;
}

export interface ScrollFocusContextValue {
  activeSession: ActiveScrollSession | null;
  /** Milliseconds left in the active block (0 if none). */
  remainingMs: number;
  /** 0 = empty, 1 = full time remaining (depletes toward 0). */
  energyRatio: number;
  /** Increments each time the player extinguishes a scroll (for toast / analytics). */
  abandonBannerTick: number;
  activateScroll: (missionId: string) => void;
  clearScroll: () => void;
  /** Extinguish active scroll on this mission: penalty Void, combo chain reset to ×1, optional toast signal. */
  abandonFocusScroll: (missionId: string) => void;
  isGreatSealActiveForMission: (missionId: string) => boolean;
}

const INACTIVE: ScrollFocusContextValue = {
  activeSession: null,
  remainingMs: 0,
  energyRatio: 0,
  abandonBannerTick: 0,
  activateScroll: () => {},
  clearScroll: () => {},
  abandonFocusScroll: () => {},
  isGreatSealActiveForMission: () => false,
};

const ScrollFocusContext = createContext<ScrollFocusContextValue | null>(null);

interface LastNaturalEnd {
  atMs: number;
  comboTier: number;
}

export function ScrollFocusProvider({ children }: { children: ReactNode }) {
  const { gainVoidCredits, loseVoidCredits } = useEconomy();
  const [activeSession, setActiveSession] = useState<ActiveScrollSession | null>(null);
  const [tick, setTick] = useState(0);
  const [abandonBannerTick, setAbandonBannerTick] = useState(0);
  const activeSessionRef = useRef<ActiveScrollSession | null>(null);
  const lastNaturalEndRef = useRef<LastNaturalEnd | null>(null);
  const completionFiredRef = useRef(false);

  activeSessionRef.current = activeSession;

  const remainingMs = useMemo(() => {
    if (!activeSession) return 0;
    return Math.max(0, activeSession.deadlineMs - Date.now());
  }, [activeSession, tick]);

  const energyRatio = useMemo(() => {
    if (!activeSession) return 0;
    const total = activeSession.deadlineMs - activeSession.startedAtMs;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, remainingMs / total));
  }, [activeSession, remainingMs]);

  const completeNaturalBlock = useCallback(
    (session: ActiveScrollSession) => {
      const gold = getScrollFocusSessionGold(session.comboTier);
      gainVoidCredits(gold);
      lastNaturalEndRef.current = { atMs: Date.now(), comboTier: session.comboTier };
      setActiveSession(null);
    },
    [gainVoidCredits],
  );

  useEffect(() => {
    if (!activeSession) return;
    if (activeSession.deadlineMs <= Date.now()) {
      if (completionFiredRef.current) return;
      completionFiredRef.current = true;
      completeNaturalBlock(activeSession);
    }
  }, [activeSession, completeNaturalBlock]);

  useEffect(() => {
    if (!activeSession) return;

    const id = window.setInterval(() => {
      setTick((n) => n + 1);
      const left = activeSession.deadlineMs - Date.now();
      if (left <= 0) {
        if (completionFiredRef.current) return;
        completionFiredRef.current = true;
        completeNaturalBlock(activeSession);
      }
    }, 250);

    return () => window.clearInterval(id);
  }, [activeSession, completeNaturalBlock]);

  const activateScroll = useCallback((missionId: string) => {
    setActiveSession((prev) => {
      if (prev?.missionId === missionId && prev.deadlineMs > Date.now()) {
        return prev;
      }
      const now = Date.now();
      const last = lastNaturalEndRef.current;
      const comboTier = computeScrollFocusComboTierOnActivate(
        now,
        last?.atMs ?? null,
        last?.comboTier ?? 0,
      );
      completionFiredRef.current = false;
      return {
        missionId,
        deadlineMs: now + SCROLL_FOCUS_DURATION_MS,
        startedAtMs: now,
        comboTier,
      };
    });
  }, []);

  const clearScroll = useCallback(() => {
    completionFiredRef.current = false;
    setActiveSession(null);
    setTick((n) => n + 1);
  }, []);

  const abandonFocusScroll = useCallback(
    (missionId: string) => {
      const s = activeSessionRef.current;
      if (!s || s.missionId !== missionId || s.deadlineMs <= Date.now()) {
        return;
      }
      loseVoidCredits(SCROLL_FOCUS_ABANDON_PENALTY_VOID);
      lastNaturalEndRef.current = null;
      completionFiredRef.current = false;
      setActiveSession(null);
      setAbandonBannerTick((n) => n + 1);
      setTick((t) => t + 1);
    },
    [loseVoidCredits],
  );

  const isGreatSealActiveForMission = useCallback(
    (missionId: string) => {
      if (!activeSession || activeSession.missionId !== missionId) return false;
      return activeSession.deadlineMs > Date.now();
    },
    [activeSession],
  );

  const value = useMemo<ScrollFocusContextValue>(
    () => ({
      activeSession,
      remainingMs,
      energyRatio,
      abandonBannerTick,
      activateScroll,
      clearScroll,
      abandonFocusScroll,
      isGreatSealActiveForMission,
    }),
    [
      activeSession,
      remainingMs,
      energyRatio,
      abandonBannerTick,
      activateScroll,
      clearScroll,
      abandonFocusScroll,
      isGreatSealActiveForMission,
    ],
  );

  return (
    <ScrollFocusContext.Provider value={value}>{children}</ScrollFocusContext.Provider>
  );
}

/** Safe outside provider: no-op focus controls (e.g. tests). */
export function useScrollFocus(): ScrollFocusContextValue {
  const ctx = useContext(ScrollFocusContext);
  return ctx ?? INACTIVE;
}
