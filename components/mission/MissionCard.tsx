import type { ReactNode } from "react";
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
  onComplete?: () => void;
}

export function MissionCard({ mission, actions }: MissionCardProps) {
  const isComplete = mission.progress >= 100;

  return (
    <section
      className={`
        relative overflow-hidden
        rounded-2xl border border-slate-200 p-5
        shadow-sm transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        ${isComplete
          ? "bg-linear-to-br from-green-50 to-green-100"
          : "bg-white"}
      `}
    >
      {/* Badge */}
      {isComplete && (
        <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
          Completada
        </div>
      )}

      {/* Header */}
      <div className={`mb-3 ${isComplete ? "pr-16" : ""}`}>
        <h3 className="text-slate-800 text-base font-bold mb-1 leading-snug">
          {mission.title}
        </h3>

        {mission.description && (
          <p className="text-slate-500 text-sm leading-relaxed">
            {mission.description}
          </p>
        )}
      </div>

      {/* XP */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 bg-linear-to-br from-amber-300 to-amber-500 text-amber-900 px-2.5 py-1 rounded-full text-xs font-bold">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          {mission.xp} XP
        </span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-slate-500 text-xs font-medium">
            Progreso
          </span>
          <span className="text-slate-600 text-xs font-semibold">
            {mission.progress}%
          </span>
        </div>

        <Progress value={mission.progress} />
      </div>

      {/* Actions */}
      {actions && (
        <div className="mt-4 pt-4 border-t border-slate-200 flex gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </section>
  );
}