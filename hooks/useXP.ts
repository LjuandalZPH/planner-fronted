import { useCallback, useEffect, useState } from "react";
import { getRankForLevel } from "@/lib/gamification";
import { fetchProfile, updateProfile } from "@/services/supabaseService";
import type { RpgProfile } from "@/types/supabase";

function rankTitleForLevel(level: number): string {
  const rank = getRankForLevel(level);
  return `${rank.titleEn} / ${rank.titleEs}`;
}

export function useXP(initialXP = 0, initialLevel = 1) {
  const [xp, setXp] = useState(initialXP);
  const [level, setLevel] = useState(initialLevel);

  useEffect(() => {
    let alive = true;
    fetchProfile().then((result) => {
      if (!alive || !result.success || !result.data) return;
      setXp(result.data.experience);
      setLevel(result.data.level);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setProgress = useCallback((profile: Pick<RpgProfile, "experience" | "level">) => {
    setXp(profile.experience);
    setLevel(profile.level);
  }, []);

  const gainXP = useCallback((amount: number) => {
    setXp((current) => {
      const total = current + amount;
      const threshold = level * 100;
      let nextLevel = level;
      let nextXp = total;
      if (total >= threshold) {
        nextLevel = level + 1;
        nextXp = total - threshold;
        setLevel(nextLevel);
      }
      void updateProfile({
        level: nextLevel,
        experience: nextXp,
        rankTitle: rankTitleForLevel(nextLevel),
      });
      return nextXp;
    });
  }, [level]);

  const nextLevelXP = level * 100;

  return { xp, level, nextLevelXP, gainXP, setProgress };
}

