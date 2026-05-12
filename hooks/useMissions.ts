import { useEffect, useState, useCallback } from "react";
import {
  createTask,
  deleteTask,
  fetchTasks,
  sealTask,
} from "@/services/supabaseService";
import type { ServiceResult, RpgContract, RpgProfile } from "@/types/supabase";
import type { Mission } from "../components/mission/MissionCard";

interface CompleteMissionOptions {
  xpMultiplier?: number;
  voidMultiplier?: number;
}

export function useMissions() {
  const [missions, setMissions] = useState<RpgContract[]>([]);

  useEffect(() => {
    let alive = true;
    fetchTasks().then((result) => {
      if (alive && result.success && result.data) {
        setMissions(result.data);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const addMission = useCallback(
    (mission: Omit<Mission, "id" | "progress">) => {
      const now = new Date().toISOString();
      const newMission: RpgContract = {
        ...mission,
        id: crypto.randomUUID(),
        progress: 0,
        xpReward: 0,
        voidReward: 0,
        isSealed: false,
        createdAt: now,
        sealedAt: null,
      };
      setMissions((prev) => [newMission, ...prev]);
      void createTask(mission, { id: newMission.id }).then((result) => {
        if (result.success && result.data) {
          setMissions((prev) =>
            prev.map((current) =>
              current.id === newMission.id ? result.data : current,
            ),
          );
        }
      });
      return newMission;
    },
    []
  );

  const updateMission = useCallback((id: string, partial: Partial<Mission>) => {
    setMissions((prev) =>
      prev.map((mission) =>
        mission.id === id ? { ...mission, ...partial } : mission
      )
    );
  }, []);

  const deleteMission = useCallback((id: string) => {
    setMissions((prev) => prev.filter((mission) => mission.id !== id));
    void deleteTask(id);
  }, []);

  const completeMission = useCallback(
    async (
      id: string,
      options: CompleteMissionOptions = {},
    ): Promise<ServiceResult<{ task: RpgContract; profile: RpgProfile }>> => {
    setMissions((prev) =>
      prev.map((mission) =>
        mission.id === id && mission.progress < 100
          ? {
              ...mission,
              progress: 100,
              isSealed: true,
              sealedAt: new Date().toISOString(),
            }
          : mission
      )
    );
      const result = await sealTask(id, options);
      if (result.success && result.data) {
        setMissions((prev) =>
          prev.map((mission) =>
            mission.id === id ? result.data.task : mission,
          ),
        );
      }
      return result;
    },
    [],
  );

  return { missions, addMission, updateMission, deleteMission, completeMission };
}
