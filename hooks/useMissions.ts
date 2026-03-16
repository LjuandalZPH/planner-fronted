import { useState } from "react";
import type { Mission } from "../components/mission/MissionCard";

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);

  function addMission(mission: Mission) {
    setMissions((prev) => [...prev, mission]);
  }

  function updateMission(id: string, partial: Partial<Mission>) {
    setMissions((prev) =>
      prev.map((mission) =>
        mission.id === id ? { ...mission, ...partial } : mission,
      ),
    );
  }

  return { missions, addMission, updateMission };
}

