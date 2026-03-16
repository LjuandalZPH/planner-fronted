import { useState } from "react";

export function useXP(initialXP = 0, initialLevel = 1) {
  const [xp, setXp] = useState(initialXP);
  const [level, setLevel] = useState(initialLevel);

  function gainXP(amount: number) {
    setXp((current) => {
      const total = current + amount;
      const threshold = level * 100;
      if (total >= threshold) {
        setLevel((prev) => prev + 1);
        return total - threshold;
      }
      return total;
    });
  }

  const nextLevelXP = level * 100;

  return { xp, level, nextLevelXP, gainXP };
}

