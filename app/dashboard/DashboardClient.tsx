"use client";

import { MissionForm } from "@/components/mission/MissionForm";
import { MissionList } from "@/components/mission/MissionList";
import { useMissions } from "@/hooks/useMissions";
import { useXP } from "@/hooks/useXP";

export function DashboardClient() {
  const { missions, addMission, updateMission, deleteMission } = useMissions();
  const { xp, level, gainXP } = useXP();

  function handleCreateMission(data: {
    title: string;
    description: string;
    xp: number;
  }) {
    addMission(data);
    gainXP(data.xp);
  }

  function handleUpdateProgress(id: string, progress: number) {
    const mission = missions.find((m) => m.id === id);
    if (mission && progress > mission.progress) {
      const xpGained = Math.floor(
        mission.xp * ((progress - mission.progress) / 100)
      );
      updateMission(id, { progress });
      if (xpGained > 0) {
        gainXP(xpGained);
      }
    }
  }

  function handleDeleteMission(id: string) {
    deleteMission(id);
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-200 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Panel de Control
          </h1>
          <p className="text-slate-500">
            Gestiona tus misiones y sigue tu progreso
          </p>
        </header>

        {/* Layout */}
        <div className="grid gap-8 items-start md:grid-cols-[350px_1fr]">
          {/* Sidebar */}
          <aside className="md:sticky md:top-8 space-y-6">
            <MissionForm onSubmit={handleCreateMission} />

            {/* Stats Card */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              {/* XP */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500">
                    Nivel {level}
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    {xp} XP
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-blue-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${xp % 100}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-slate-800">
                    {missions.length}
                  </div>
                  <div className="text-xs text-slate-500">
                    Misiones
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-slate-800">
                    {missions.filter((m) => m.progress >= 100).length}
                  </div>
                  <div className="text-xs text-slate-500">
                    Completadas
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                Tus Misiones
              </h2>
              <span className="text-sm text-slate-500">
                {missions.filter((m) => m.progress < 100).length} activas
              </span>
            </div>

            <MissionList
              missions={missions}
              onUpdateProgress={handleUpdateProgress}
              onDelete={handleDeleteMission}
            />
          </main>
        </div>
      </div>
    </div>
  );
}