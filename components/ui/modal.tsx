"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Tailwind max-width / width utilities for the dialog shell (default: max-w-md). */
  dialogClassName?: string;
  /** Visual accent for the dialog chrome. */
  tone?: "cyan" | "amber";
}

const TONE_STYLES: Record<
  NonNullable<ModalProps["tone"]>,
  { shell: string; glow: string }
> = {
  cyan: {
    shell:
      "border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.2),0_25px_50px_-12px_rgba(0,0,0,0.5)]",
    glow: "bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.1)_0%,transparent_50%)]",
  },
  amber: {
    shell:
      "border-amber-500/55 shadow-[0_0_44px_rgba(251,191,36,0.22),0_25px_50px_-12px_rgba(0,0,0,0.55)]",
    glow: "bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.12)_0%,transparent_52%)]",
  },
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  dialogClassName = "max-w-md",
  tone = "cyan",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const chroma = TONE_STYLES[tone];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full ${dialogClassName} overflow-hidden rounded-2xl border bg-linear-to-b from-slate-900 to-slate-950 ${chroma.shell}`}
      >
        <div className={`pointer-events-none absolute inset-0 ${chroma.glow}`} />

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <h2
            id="modal-title"
            className="font-cinzel text-lg font-semibold text-slate-50"
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[min(90vh,52rem)] overflow-y-auto overscroll-contain p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
