import { renderHook, act } from "@testing-library/react";
import { useMissions } from "@/hooks/useMissions";

describe("useMissions Hook", () => {
  describe("Initial State", () => {
    it("should initialize with empty missions array", () => {
      const { result } = renderHook(() => useMissions());

      expect(result.current.missions).toEqual([]);
    });
  });

  describe("addMission", () => {
    it("should add a new mission with id and progress 0", () => {
      const { result } = renderHook(() => useMissions());

      act(() => {
        result.current.addMission({
          title: "Test Mission",
          description: "Test Description",
          rarity: "rare",
        });
      });

      expect(result.current.missions).toHaveLength(1);
      expect(result.current.missions[0]).toMatchObject({
        title: "Test Mission",
        description: "Test Description",
        rarity: "rare",
        progress: 0,
      });
      expect(result.current.missions[0].id).toBeDefined();
    });

    it("should add new mission at the beginning of the array", () => {
      const { result } = renderHook(() => useMissions());

      act(() => {
        result.current.addMission({ title: "Mission 1", description: "", rarity: "common" });
      });
      act(() => {
        result.current.addMission({ title: "Mission 2", description: "", rarity: "rare" });
      });

      expect(result.current.missions[0].title).toBe("Mission 2");
      expect(result.current.missions[1].title).toBe("Mission 1");
    });

    it("should generate unique IDs for each mission", () => {
      const { result } = renderHook(() => useMissions());

      act(() => {
        result.current.addMission({ title: "Mission 1", description: "", rarity: "common" });
      });
      act(() => {
        result.current.addMission({ title: "Mission 2", description: "", rarity: "rare" });
      });

      const ids = result.current.missions.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(2);
    });
  });

  describe("updateMission", () => {
    it("should update mission properties", () => {
      const { result } = renderHook(() => useMissions());

      act(() => {
        result.current.addMission({
          title: "Test",
          description: "",
          rarity: "common",
        });
      });

      const missionId = result.current.missions[0].id;

      act(() => {
        result.current.updateMission(missionId, { progress: 50 });
      });

      expect(result.current.missions[0].progress).toBe(50);
    });

    it("should only update the specified mission", () => {
      const { result } = renderHook(() => useMissions());

      act(() => {
        result.current.addMission({ title: "Mission 1", description: "", rarity: "common" });
      });
      act(() => {
        result.current.addMission({ title: "Mission 2", description: "", rarity: "rare" });
      });

      const mission1Id = result.current.missions[1].id;
      const mission2Id = result.current.missions[0].id;

      act(() => {
        result.current.updateMission(mission1Id, { progress: 75 });
      });

      const mission1 = result.current.missions.find((m) => m.id === mission1Id);
      const mission2 = result.current.missions.find((m) => m.id === mission2Id);

      expect(mission1?.progress).toBe(75);
      expect(mission2?.progress).toBe(0);
    });
  });

  describe("deleteMission", () => {
    it("should remove mission by id", () => {
      const { result } = renderHook(() => useMissions());

      act(() => {
        result.current.addMission({ title: "Test", description: "", rarity: "common" });
      });

      const missionId = result.current.missions[0].id;

      act(() => {
        result.current.deleteMission(missionId);
      });

      expect(result.current.missions).toHaveLength(0);
    });

    it("should only delete the specified mission", () => {
      const { result } = renderHook(() => useMissions());

      act(() => {
        result.current.addMission({ title: "Mission 1", description: "", rarity: "common" });
      });
      act(() => {
        result.current.addMission({ title: "Mission 2", description: "", rarity: "rare" });
      });

      const mission1Id = result.current.missions[1].id;
      const mission2Id = result.current.missions[0].id;

      act(() => {
        result.current.deleteMission(mission1Id);
      });

      expect(result.current.missions).toHaveLength(1);
      expect(result.current.missions[0].id).toBe(mission2Id);
    });
  });

  describe("completeMission", () => {
    it("should set mission progress to 100", () => {
      const { result } = renderHook(() => useMissions());

      act(() => {
        result.current.addMission({ title: "Test", description: "", rarity: "common" });
      });

      const missionId = result.current.missions[0].id;

      act(() => {
        result.current.completeMission(missionId);
      });

      expect(result.current.missions[0].progress).toBe(100);
    });

    it("should not affect other missions", () => {
      const { result } = renderHook(() => useMissions());

      act(() => {
        result.current.addMission({ title: "Mission 1", description: "", rarity: "common" });
      });
      act(() => {
        result.current.addMission({ title: "Mission 2", description: "", rarity: "rare" });
      });

      const mission1Id = result.current.missions[1].id;
      const mission2Id = result.current.missions[0].id;

      act(() => {
        result.current.completeMission(mission1Id);
      });

      const mission1 = result.current.missions.find((m) => m.id === mission1Id);
      const mission2 = result.current.missions.find((m) => m.id === mission2Id);

      expect(mission1?.progress).toBe(100);
      expect(mission2?.progress).toBe(0);
    });
  });
});
