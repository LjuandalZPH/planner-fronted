"use client";

import { Scroll } from "lucide-react";
import { MissionCard } from "./MissionCard";
import type { Mission } from "./MissionCard";

interface MissionListProps {
  missions: Mission[];
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  completingId?: string | null;
}

export function MissionList({
  missions,
  onComplete,
  onDelete,
  completingId,
}: MissionListProps) {
  if (!missions.length) {
    return (
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-800 bg-linear-to-b from-slate-900 to-slate-950 px-8 py-16 text-center">
        
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.05)_0%,transparent_60%)]" />

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-slate-800 bg-linear-to-br from-slate-800 to-slate-900">
          <Scroll size={28} className="text-slate-500" />
        </div>

        {/* Text */}
        <h3 className="font-cinzel mb-2 text-xl font-semibold text-slate-50">
          No Pending Contracts
        </h3>

        <p className="text-sm text-slate-500">
          Press the &quot;Accept New Contract&quot; button to start your adventure
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onComplete={onComplete}
          onDelete={onDelete}
          isCompleting={completingId === mission.id}
        />
      ))}
    </div>
  );
}