import { useState, useEffect, useCallback, useRef } from "react";
import {
  applyStreakOnAppOpen,
  computeStreakAfterMissionSeal,
  type UserStreakFields,
} from "@/lib/gamification";
import { fetchProfile, updateProfile } from "@/services/supabaseService";

const INITIAL_STREAK: UserStreakFields = {
  currentStreak: 0,
  lastCompletionDate: null,
};

/**
 * MVP streak state (memory). Mirror fields on the user profile when wiring Supabase.
 */
export function useStreak() {
  const [fields, setFields] = useState<UserStreakFields>(INITIAL_STREAK);
  const fieldsRef = useRef<UserStreakFields>(INITIAL_STREAK);

  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  useEffect(() => {
    let alive = true;
    fetchProfile().then((result) => {
      if (!alive) return;
      const persisted: UserStreakFields = result.success && result.data
        ? {
            currentStreak: result.data.streakCount,
            lastCompletionDate: result.data.lastCompletionDate,
          }
        : fieldsRef.current;
      const next = applyStreakOnAppOpen(persisted, new Date());
      fieldsRef.current = next;
      setFields(next);
      if (next.currentStreak !== persisted.currentStreak) {
        void updateProfile({ streakCount: next.currentStreak });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  /**
   * Call once when a contract is sealed successfully.
   * @returns new streak count when the first seal of the local day increased the counter; otherwise null.
   */
  const registerMissionSeal = useCallback((now: Date = new Date()): number | null => {
    const opened = applyStreakOnAppOpen(fieldsRef.current, now);
    const prevStreak = opened.currentStreak;
    const result = computeStreakAfterMissionSeal(opened, now);
    fieldsRef.current = result.next;
    setFields(result.next);
    void updateProfile({
      streakCount: result.next.currentStreak,
      lastCompletionDate: result.next.lastCompletionDate,
    });
    if (result.isFirstSealOfLocalDay && result.newStreak > prevStreak) {
      return result.newStreak;
    }
    return null;
  }, []);

  return { streak: fields, registerMissionSeal };
}
