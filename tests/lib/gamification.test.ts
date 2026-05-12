import {
  applyStreakOnAppOpen,
  computeScrollFocusComboTierOnActivate,
  computeStreakAfterMissionSeal,
  getFocusComboGoldMultiplier,
  getRankForLevel,
  getRankTierId,
  getRankTitlePresentation,
  getScrollFocusSessionGold,
  getVoidCreditsForMissionSeal,
  hoursBetweenEarlierAndLater,
  isSameLocalCalendarDay,
  isStreakAtRisk,
  SCROLL_FOCUS_ABANDON_PENALTY_VOID,
  SCROLL_FOCUS_COMBO_CHAIN_MS,
} from "@/lib/gamification";

describe("scroll of focus helpers", () => {
  it("defines abandon penalty void credits", () => {
    expect(SCROLL_FOCUS_ABANDON_PENALTY_VOID).toBe(10);
  });

  it("gold multiplier steps by 0.1 per combo tier", () => {
    expect(getFocusComboGoldMultiplier(0)).toBe(1);
    expect(getFocusComboGoldMultiplier(1)).toBeCloseTo(1.1);
    expect(getFocusComboGoldMultiplier(3)).toBeCloseTo(1.3);
  });

  it("session gold floors base times multiplier", () => {
    expect(getScrollFocusSessionGold(0)).toBe(5);
    expect(getScrollFocusSessionGold(1)).toBe(Math.floor(5 * 1.1));
  });

  it("combo tier resets outside chain window", () => {
    const t0 = 1_000_000;
    const lastEnd = t0 - SCROLL_FOCUS_COMBO_CHAIN_MS - 1;
    expect(
      computeScrollFocusComboTierOnActivate(t0, lastEnd, 3),
    ).toBe(0);
  });

  it("combo tier increments within chain window", () => {
    const t0 = 2_000_000;
    const lastEnd = t0 - 60_000;
    expect(computeScrollFocusComboTierOnActivate(t0, lastEnd, 2)).toBe(3);
  });
});

describe("void credits economy", () => {
  it("scales with rarity and rank tier", () => {
    expect(getVoidCreditsForMissionSeal("common", 1)).toBe(2);
    expect(getVoidCreditsForMissionSeal("legendary", 1)).toBe(25);
    expect(getVoidCreditsForMissionSeal("legendary", 13)).toBe(
      Math.floor(25 * 1.35),
    );
  });
});

describe("rank helpers", () => {
  it("maps level bands to narrative tiers", () => {
    expect(getRankTierId(1)).toBe("forsaken");
    expect(getRankTierId(5)).toBe("forsaken");
    expect(getRankTierId(6)).toBe("sellsword");
    expect(getRankTierId(12)).toBe("sellsword");
    expect(getRankTierId(13)).toBe("shadow_blade");
    expect(getRankTierId(20)).toBe("shadow_blade");
    expect(getRankTierId(21)).toBe("dread_knight");
    expect(getRankTierId(35)).toBe("dread_knight");
    expect(getRankTierId(36)).toBe("mythic_sovereign");
    expect(getRankTierId(999)).toBe("mythic_sovereign");
  });

  it("clamps invalid levels to at least forsaken tier", () => {
    expect(getRankForLevel(0).tierId).toBe("forsaken");
    expect(getRankForLevel(-3).tierId).toBe("forsaken");
  });

  it("returns presentation tiers in range", () => {
    const low = getRankTitlePresentation(0);
    expect(low.englishClass).toContain("slate");

    const high = getRankTitlePresentation(4);
    expect(high.englishClass).toContain("amber");
  });
});

describe("streak helpers", () => {
  const iso = (d: Date) => d.toISOString();

  it("isSameLocalCalendarDay matches local midnight boundaries", () => {
    const a = new Date(2026, 4, 10, 23, 0, 0);
    const b = new Date(2026, 4, 10, 1, 0, 0);
    expect(isSameLocalCalendarDay(a, b)).toBe(true);
    const c = new Date(2026, 4, 11, 0, 30, 0);
    expect(isSameLocalCalendarDay(a, c)).toBe(false);
  });

  it("applyStreakOnAppOpen zeros streak after more than 48 hours", () => {
    const last = new Date("2026-05-08T12:00:00.000Z");
    const now = new Date("2026-05-11T12:00:00.000Z");
    expect(hoursBetweenEarlierAndLater(last, now)).toBeGreaterThan(48);

    const out = applyStreakOnAppOpen(
      { currentStreak: 5, lastCompletionDate: iso(last) },
      now,
    );
    expect(out.currentStreak).toBe(0);
    expect(out.lastCompletionDate).toBe(iso(last));
  });

  it("applyStreakOnAppOpen keeps streak within 48 hours", () => {
    const last = new Date("2026-05-10T12:00:00.000Z");
    const now = new Date("2026-05-11T10:00:00.000Z");
    const out = applyStreakOnAppOpen(
      { currentStreak: 3, lastCompletionDate: iso(last) },
      now,
    );
    expect(out.currentStreak).toBe(3);
  });

  it("first seal ever sets streak to 1", () => {
    const now = new Date("2026-05-11T15:00:00.000Z");
    const r = computeStreakAfterMissionSeal(
      { currentStreak: 0, lastCompletionDate: null },
      now,
    );
    expect(r.newStreak).toBe(1);
    expect(r.isFirstSealOfLocalDay).toBe(true);
    expect(r.next.lastCompletionDate).toBeTruthy();
  });

  it("second seal same local day keeps streak", () => {
    const morning = new Date("2026-05-11T09:00:00.000Z");
    const evening = new Date("2026-05-11T20:00:00.000Z");
    const afterFirst = computeStreakAfterMissionSeal(
      { currentStreak: 0, lastCompletionDate: null },
      morning,
    );
    const afterSecond = computeStreakAfterMissionSeal(afterFirst.next, evening);
    expect(afterSecond.newStreak).toBe(1);
    expect(afterSecond.isFirstSealOfLocalDay).toBe(false);
  });

  it("first seal of a new day after >24h resets streak to 1", () => {
    const last = new Date("2026-05-09T12:00:00.000Z");
    const now = new Date("2026-05-11T12:00:00.000Z");
    const r = computeStreakAfterMissionSeal(
      { currentStreak: 7, lastCompletionDate: iso(last) },
      now,
    );
    expect(r.isFirstSealOfLocalDay).toBe(true);
    expect(r.newStreak).toBe(1);
  });

  it("first seal of a new day within 24h increments streak", () => {
    const last = new Date("2026-05-10T22:00:00.000Z");
    const now = new Date("2026-05-11T10:00:00.000Z");
    expect(hoursBetweenEarlierAndLater(last, now)).toBeLessThanOrEqual(24);
    const r = computeStreakAfterMissionSeal(
      { currentStreak: 4, lastCompletionDate: iso(last) },
      now,
    );
    expect(r.newStreak).toBe(5);
  });

  it("isStreakAtRisk when streak > 0 and last completion not today", () => {
    const last = new Date("2026-05-10T08:00:00.000Z");
    const now = new Date("2026-05-11T08:00:00.000Z");
    expect(
      isStreakAtRisk(
        { currentStreak: 2, lastCompletionDate: iso(last) },
        now,
      ),
    ).toBe(true);
  });

  it("isStreakAtRisk is false after sealing today", () => {
    const now = new Date("2026-05-11T18:00:00.000Z");
    expect(
      isStreakAtRisk(
        { currentStreak: 2, lastCompletionDate: iso(now) },
        now,
      ),
    ).toBe(false);
  });
});
