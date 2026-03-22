import { MissionCard, type Mission } from "./MissionCard";
import { Button } from "../ui/button";
import { Layers } from "lucide-react";

interface MissionListProps {
  missions: Mission[];
  onUpdateProgress?: (id: string, progress: number) => void;
  onDelete?: (id: string) => void;
}

export function MissionList({ missions, onUpdateProgress, onDelete }: MissionListProps) {
  if (!missions.length) {
    return (
      <div className="text-center px-6 py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-linear-to-br from-slate-200 to-slate-300">
          <Layers className="text-slate-600" />
        </div>

        <h3 className="text-slate-600 text-lg font-semibold mb-2">
          Sin misiones aún
        </h3>

        <p className="text-slate-500 text-sm">
          Crea tu primera misión para comenzar tu aventura
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          actions={
            <div className="flex gap-2 flex-wrap">
              {onUpdateProgress && (
                <Button
                  onClick={() => {
                    const newProgress = Math.min(100, mission.progress + 25);
                    onUpdateProgress(mission.id, newProgress);
                  }}
                  disabled={mission.progress >= 100}
                  className={`
                    px-3 py-1.5 text-xs
                    ${mission.progress >= 100
                      ? "bg-slate-400"
                      : "bg-linear-to-br from-green-500 to-green-600"}
                  `}
                >
                  +25% Progreso
                </Button>
              )}

              {onDelete && (
                <Button
                  onClick={() => onDelete(mission.id)}
                  className="px-3 py-1.5 text-xs bg-linear-to-br from-red-500 to-red-600"
                >
                  Eliminar
                </Button>
              )}
            </div>
          }
        />
      ))}
    </div>
  );
}