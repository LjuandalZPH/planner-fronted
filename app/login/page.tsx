"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Chrome, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, error, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, user]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 60% at 50% -10%, rgba(34,211,238,0.16), transparent 55%),
            radial-gradient(ellipse 80% 50% at 100% 40%, rgba(168,85,247,0.12), transparent 50%),
            radial-gradient(ellipse 80% 55% at 0% 70%, rgba(251,191,36,0.09), transparent 50%)
          `,
        }}
      />

      <section className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/25 bg-linear-to-b from-slate-900/95 via-slate-950/98 to-slate-950 p-8 text-center shadow-[0_0_60px_rgba(34,211,238,0.16)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12)_0%,transparent_58%)]" />
        <div className="relative">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-950/40 shadow-[0_0_34px_rgba(34,211,238,0.28)]">
            <Sparkles className="h-9 w-9 text-cyan-200 drop-shadow-[0_0_16px_rgba(34,211,238,0.85)]" aria-hidden />
          </div>

          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-200">
            <ShieldCheck size={13} aria-hidden />
            Secured by Supabase
          </p>

          <h1 className="font-cinzel text-4xl font-extrabold tracking-tight text-slate-50 drop-shadow-[0_0_36px_rgba(34,211,238,0.28)] md:text-5xl">
            Enter the Void
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Authenticate your hero, bind your contracts, and keep your Black Market rewards sealed to your account.
          </p>

          {error ? (
            <p className="mt-6 rounded-xl border border-red-500/35 bg-red-950/35 px-4 py-3 text-sm text-red-100" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={isLoading}
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-cyan-400/45 bg-linear-to-br from-cyan-500 to-cyan-700 px-6 py-4 font-cinzel text-sm font-extrabold uppercase tracking-[0.18em] text-slate-950 shadow-[0_0_36px_rgba(34,211,238,0.32)] transition hover:from-cyan-400 hover:to-cyan-600 disabled:cursor-wait disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Chrome className="h-5 w-5" aria-hidden />
            )}
            Enter the Void with Google
          </button>
        </div>
      </section>
    </main>
  );
}