"use client";

import { useState } from "react";
import { MissionForm } from "@/components/mission/MissionForm";
import { MissionList } from "@/components/mission/MissionList";
import { HeroProfile } from "@/components/gamification/HeroProfile";
import { Modal } from "@/components/ui/modal";
import { FAB } from "@/components/ui/fab";
import { useMissions } from "@/hooks/useMissions";
import { useXP } from "@/hooks/useXP";
import { Scroll } from "lucide-react";

export function DashboardClient() {
  const { missions, addMission, completeMission, deleteMission } = useMissions();
  const { xp, level, nextLevelXP, gainXP } = useXP();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  function handleCreateMission(data: {
    title: string;
    description: string;
    xp: number;
  }) {
    setIsSubmitting(true);
    addMission(data);
    gainXP(Math.floor(data.xp * 0.1));
    setIsSubmitting(false);
    setIsModalOpen(false);
  }

  async function handleCompleteMission(id: string) {
    const mission = missions.find((m) => m.id === id);
    if (!mission) return;

    setCompletingId(id);
    await new Promise((resolve) => setTimeout(resolve, 800));
    completeMission(id);
    gainXP(mission.xp);
    setCompletingId(null);
  }

  function handleDeleteMission(id: string) {
    deleteMission(id);
  }

  const completedCount = missions.filter((m) => m.progress >= 100).length;
  const pendingCount = missions.filter((m) => m.progress < 100).length;

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.08)_0%,transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl p-6">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="font-cinzel mb-2 text-3xl font-extrabold text-slate-50 md:text-4xl lg:text-5xl drop-shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            Mission Board
          </h1>

          <p className="flex items-center justify-center gap-2 text-slate-500">
            <Scroll size={16} className="text-purple-500" />
            Accept contracts and seal your destiny
          </p>
        </header>

        {/* Layout */}
        <div className="grid gap-6">
          <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
            
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-6">
              <HeroProfile
                level={level}
                xp={xp}
                nextLevelXP={nextLevelXP}
                totalMissions={missions.length}
                completedMissions={completedCount}
              />
            </aside>

            {/* Main */}
            <main>
              {/* Section header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-cinzel text-xl font-semibold text-slate-50">
                  Active Contracts
                </h2>

                <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-slate-500">
                  {pendingCount} pending
                </span>
              </div>

              <MissionList
                missions={missions}
                onComplete={handleCompleteMission}
                onDelete={handleDeleteMission}
                completingId={completingId}
              />
            </main>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <FAB onClick={() => setIsModalOpen(true)} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Accept New Contract"
      >
        <MissionForm
          onSubmit={handleCreateMission}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}