import type { ReactNode } from "react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  progress: number;
}

interface MissionCardProps {
  mission: Mission;
  actions?: ReactNode;
}

export function MissionCard({ mission, actions }: MissionCardProps) {
  return (
    <Card title={mission.title}>
      <p>{mission.description}</p>
      <p style={{ marginTop: "0.5rem", fontWeight: 600 }}>
        {mission.xp} XP
      </p>
      <div style={{ marginTop: "0.5rem" }}>
        <Progress value={mission.progress} />
      </div>
      {actions && <div style={{ marginTop: "0.75rem" }}>{actions}</div>}
    </Card>
  );
}

