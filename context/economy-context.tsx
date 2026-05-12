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
import {
  blackMarketItemCreateSchema,
  blackMarketItemsArraySchema,
  type BlackMarketItem,
  type BlackMarketItemCreateInput,
} from "@/types/black-market";
import {
  createRelic,
  deleteRelic,
  fetchProfile,
  fetchRelics,
  purchaseRelic,
  updateProfile,
} from "@/services/supabaseService";

const STORAGE_CREDITS = "planner_void_credits_v1";
const STORAGE_ITEMS = "planner_black_market_items_v1";

export interface EconomyMutationResult {
  success: boolean;
  error?: string;
}

interface EconomyState {
  voidCredits: number;
  items: BlackMarketItem[];
}

interface EconomyContextValue {
  voidCredits: number;
  displayVoidCredits: number;
  items: BlackMarketItem[];
  setVoidCreditsBalance: (amount: number) => void;
  gainVoidCredits: (amount: number) => void;
  /** Subtracts credits, floored at 0 balance (no negative balance). */
  loseVoidCredits: (amount: number) => void;
  addUserItem: (input: BlackMarketItemCreateInput) => EconomyMutationResult;
  removeUserItem: (id: string) => EconomyMutationResult;
  purchaseItem: (id: string) => EconomyMutationResult;
}

const EconomyContext = createContext<EconomyContextValue | null>(null);

function readCreditsFromStorage(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_CREDITS);
    if (raw === null) return 0;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.floor(n);
  } catch {
    return 0;
  }
}

function readItemsFromStorage(): BlackMarketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_ITEMS);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    const out = blackMarketItemsArraySchema.safeParse(parsed);
    return out.success ? out.data : [];
  } catch {
    return [];
  }
}

export function EconomyProvider({ children }: { children: ReactNode }) {
  const [economy, setEconomy] = useState<EconomyState>({
    voidCredits: 0,
    items: [],
  });
  const [displayVoidCredits, setDisplayVoidCredits] = useState(0);
  const [storageReady, setStorageReady] = useState(false);
  const rafRef = useRef<number | null>(null);
  const displayRef = useRef(0);
  const hasHydratedDisplayRef = useRef(false);

  useEffect(() => {
    displayRef.current = displayVoidCredits;
  }, [displayVoidCredits]);

  useEffect(() => {
    setEconomy({
      voidCredits: readCreditsFromStorage(),
      items: readItemsFromStorage(),
    });
    const c = readCreditsFromStorage();
    setDisplayVoidCredits(c);
    displayRef.current = c;
    setStorageReady(true);
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchProfile(), fetchRelics()]).then(([profileResult, relicsResult]) => {
      if (!alive) return;
      setEconomy((prev) => ({
        voidCredits:
          profileResult.success && profileResult.data
            ? profileResult.data.voidCredits
            : prev.voidCredits,
        items:
          relicsResult.success && relicsResult.data
            ? relicsResult.data
            : prev.items,
      }));
      if (profileResult.success && profileResult.data) {
        setDisplayVoidCredits(profileResult.data.voidCredits);
        displayRef.current = profileResult.data.voidCredits;
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_CREDITS, String(economy.voidCredits));
    } catch {
      /* ignore quota */
    }
  }, [economy.voidCredits, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_ITEMS, JSON.stringify(economy.items));
    } catch {
      /* ignore quota */
    }
  }, [economy.items, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    if (!hasHydratedDisplayRef.current) {
      hasHydratedDisplayRef.current = true;
      setDisplayVoidCredits(economy.voidCredits);
      displayRef.current = economy.voidCredits;
      return;
    }
    const start = displayRef.current;
    const end = economy.voidCredits;
    if (start === end) return;

    const duration = 680;
    const t0 = performance.now();

    const cancelRaf = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    cancelRaf();

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(start + (end - start) * eased);
      displayRef.current = next;
      setDisplayVoidCredits(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        displayRef.current = end;
        setDisplayVoidCredits(end);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return cancelRaf;
  }, [economy.voidCredits, storageReady]);

  const setVoidCreditsBalance = useCallback((amount: number) => {
    const next = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    setEconomy((prev) => ({ ...prev, voidCredits: next }));
    void updateProfile({ voidCredits: next });
  }, []);

  const gainVoidCredits = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setEconomy((prev) => ({
      ...prev,
      voidCredits: prev.voidCredits + Math.floor(amount),
    }));
  }, []);

  const loseVoidCredits = useCallback((amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const delta = Math.floor(amount);
    setEconomy((prev) => ({
      ...prev,
      voidCredits: Math.max(0, prev.voidCredits - delta),
    }));
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    void updateProfile({ voidCredits: economy.voidCredits });
  }, [economy.voidCredits, storageReady]);

  const addUserItem = useCallback((input: BlackMarketItemCreateInput): EconomyMutationResult => {
    const parsed = blackMarketItemCreateSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return { success: false, error: first?.message ?? "Invalid listing" };
    }
    const row: BlackMarketItem = {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      costCredits: parsed.data.costCredits,
      iconId: parsed.data.iconId,
      source: "user",
      redeemedAt: null,
    };
    setEconomy((prev) => ({ ...prev, items: [row, ...prev.items] }));
    void createRelic(parsed.data, { id: row.id });
    return { success: true };
  }, []);

  const removeUserItem = useCallback((id: string): EconomyMutationResult => {
    let ok = false;
    setEconomy((prev) => {
      const target = prev.items.find((i) => i.id === id);
      if (!target || target.source !== "user") return prev;
      ok = true;
      void deleteRelic(id);
      return { ...prev, items: prev.items.filter((i) => i.id !== id) };
    });
    return ok ? { success: true } : { success: false, error: "Not found or locked" };
  }, []);

  const purchaseItem = useCallback((id: string): EconomyMutationResult => {
    let result: EconomyMutationResult = { success: false, error: "Not found" };
    setEconomy((prev) => {
      const item = prev.items.find((i) => i.id === id);
      if (!item) {
        result = { success: false, error: "Not found" };
        return prev;
      }
      if (item.redeemedAt !== null) {
        result = { success: false, error: "Already redeemed" };
        return prev;
      }
      if (prev.voidCredits < item.costCredits) {
        result = { success: false, error: "Insufficient Void Credits" };
        return prev;
      }
      const stamped = new Date().toISOString();
      result = { success: true };
      void purchaseRelic(id).then((purchaseResult) => {
        if (purchaseResult.success && purchaseResult.data) {
          setEconomy((current) => ({
            voidCredits: purchaseResult.data.profile.voidCredits,
            items: current.items.map((i) =>
              i.id === id ? purchaseResult.data.relic : i,
            ),
          }));
        }
      });
      return {
        voidCredits: prev.voidCredits - item.costCredits,
        items: prev.items.map((i) =>
          i.id === id ? { ...i, redeemedAt: stamped } : i,
        ),
      };
    });
    return result;
  }, []);

  const value = useMemo<EconomyContextValue>(
    () => ({
      voidCredits: economy.voidCredits,
      displayVoidCredits,
      items: economy.items,
      setVoidCreditsBalance,
      gainVoidCredits,
      loseVoidCredits,
      addUserItem,
      removeUserItem,
      purchaseItem,
    }),
    [
      economy.voidCredits,
      economy.items,
      displayVoidCredits,
      setVoidCreditsBalance,
      gainVoidCredits,
      loseVoidCredits,
      addUserItem,
      removeUserItem,
      purchaseItem,
    ],
  );

  return <EconomyContext.Provider value={value}>{children}</EconomyContext.Provider>;
}

export function useEconomy(): EconomyContextValue {
  const ctx = useContext(EconomyContext);
  if (!ctx) {
    throw new Error("useEconomy must be used within EconomyProvider");
  }
  return ctx;
}
