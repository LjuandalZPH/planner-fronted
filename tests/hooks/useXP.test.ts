import { renderHook, act } from "@testing-library/react";
import { useXP } from "@/hooks/useXP";

describe("useXP Hook", () => {
  describe("Initial State", () => {
    it("should initialize with default values (level 1, xp 0)", () => {
      const { result } = renderHook(() => useXP());

      expect(result.current.level).toBe(1);
      expect(result.current.xp).toBe(0);
      expect(result.current.nextLevelXP).toBe(100);
    });

    it("should initialize with custom values", () => {
      const { result } = renderHook(() => useXP(50, 2));

      expect(result.current.level).toBe(2);
      expect(result.current.xp).toBe(50);
      expect(result.current.nextLevelXP).toBe(200);
    });
  });

  describe("gainXP", () => {
    it("should add XP without leveling up when below threshold", () => {
      const { result } = renderHook(() => useXP());

      act(() => {
        result.current.gainXP(25);
      });

      expect(result.current.xp).toBe(25);
      expect(result.current.level).toBe(1);
    });

    it("should accumulate XP correctly", () => {
      const { result } = renderHook(() => useXP());

      act(() => {
        result.current.gainXP(20);
      });
      act(() => {
        result.current.gainXP(30);
      });

      expect(result.current.xp).toBe(50);
      expect(result.current.level).toBe(1);
    });

    it("should level up when XP reaches threshold", () => {
      const { result } = renderHook(() => useXP(90, 1));

      act(() => {
        result.current.gainXP(15);
      });

      expect(result.current.level).toBe(2);
      expect(result.current.xp).toBe(5);
    });

    it("should calculate nextLevelXP based on current level", () => {
      const { result } = renderHook(() => useXP(95, 1));

      expect(result.current.nextLevelXP).toBe(100);

      act(() => {
        result.current.gainXP(10);
      });

      expect(result.current.level).toBe(2);
      expect(result.current.nextLevelXP).toBe(200);
    });

    it("should handle large XP gains", () => {
      const { result } = renderHook(() => useXP());

      act(() => {
        result.current.gainXP(350);
      });

      expect(result.current.level).toBe(2);
      expect(result.current.xp).toBe(250);
    });

    it("should handle exact threshold XP gain", () => {
      const { result } = renderHook(() => useXP(50, 1));

      act(() => {
        result.current.gainXP(50);
      });

      expect(result.current.level).toBe(2);
      expect(result.current.xp).toBe(0);
    });
  });
});
