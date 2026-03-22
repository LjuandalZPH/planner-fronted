"use client";

import { Plus } from "lucide-react";

interface FABProps {
  onClick: () => void;
  label?: string;
}

export function FAB({ onClick, label = "Accept New Contract" }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-8 right-8 z-40
        flex items-center gap-2
        rounded-full px-6 py-4
        bg-linear-to-br from-cyan-500 to-cyan-600
        font-cinzel text-sm font-bold text-slate-950
        shadow-[0_0_20px_rgba(34,211,238,0.4),0_10px_25px_-5px_rgba(0,0,0,0.4)]
        transition-all duration-200
        hover:scale-105
        hover:shadow-[0_0_30px_rgba(34,211,238,0.6),0_15px_30px_-5px_rgba(0,0,0,0.4)]
        active:scale-95
      "
    >
      <Plus size={20} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}