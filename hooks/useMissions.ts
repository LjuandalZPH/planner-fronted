import { useState, useCallback } from "react";
import type { Mission } from "../components/mission/MissionCard";

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);

  const addMission = useCallback(
    (mission: Omit<Mission, "id" | "progress">) => {
      const newMission: Mission = {
        ...mission,
        id: crypto.randomUUID(),
        progress: 0,
      };
      setMissions((prev) => [newMission, ...prev]);
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
  }, []);

  return { missions, addMission, updateMission, deleteMission };
}
