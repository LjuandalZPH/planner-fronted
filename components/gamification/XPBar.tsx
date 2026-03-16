import { Progress } from "../ui/progress";

interface XPBarProps {
  currentXP: number;
  nextLevelXP: number;
}

export function XPBar({ currentXP, nextLevelXP }: XPBarProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <Progress value={currentXP} max={nextLevelXP} />
      <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
        {currentXP} / {nextLevelXP} XP
      </span>
    </div>
  );
}

