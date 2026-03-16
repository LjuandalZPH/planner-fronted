import { MissionCard, type Mission } from "./MissionCard";

interface MissionListProps {
  missions: Mission[];
}

export function MissionList({ missions }: MissionListProps) {
  if (!missions.length) {
    return <p>No hay misiones todavía.</p>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1rem",
      }}
    >
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} />
      ))}
    </div>
  );
}

