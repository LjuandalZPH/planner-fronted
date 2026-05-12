"use client";

import { Sword, Mail, Lock, User, ShieldPlus } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-3xl rounded-full top-[-120px] right-[-120px]" />
      <div className="absolute w-[420px] h-[420px] bg-purple-500/10 blur-3xl rounded-full bottom-[-130px] left-[-130px]" />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-cyan-900/40 bg-[#071126]/90 backdrop-blur-xl shadow-[0_0_40px_rgba(0,255,255,0.08)] p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.45)] mb-4">
            <Sword className="text-black w-10 h-10" />
          </div>

          <h1 className="text-5xl font-serif tracking-wide text-white">
            Join Guild
          </h1>

          <p className="text-slate-400 mt-3 flex items-center gap-2 text-sm">
            <ShieldPlus size={16} className="text-purple-400" />
            Create your adventurer profile
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Adventurer Name
            </label>

            <div className="flex items-center gap-3 bg-[#0b1730] border border-cyan-900/30 rounded-2xl px-4 py-3 focus-within:border-cyan-400 transition">
              <User className="text-cyan-400" size={18} />
              <input
                type="text"
                placeholder="Your name"
                className="bg-transparent outline-none w-full text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Adventurer Email
            </label>

            <div className="flex items-center gap-3 bg-[#0b1730] border border-cyan-900/30 rounded-2xl px-4 py-3 focus-within:border-cyan-400 transition">
              <Mail className="text-cyan-400" size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                className="bg-transparent outline-none w-full text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Secret Key
            </label>

            <div className="flex items-center gap-3 bg-[#0b1730] border border-cyan-900/30 rounded-2xl px-4 py-3 focus-within:border-cyan-400 transition">
              <Lock className="text-cyan-400" size={18} />
              <input
                type="password"
                placeholder="Create password"
                className="bg-transparent outline-none w-full text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Confirm Secret Key
            </label>

            <div className="flex items-center gap-3 bg-[#0b1730] border border-cyan-900/30 rounded-2xl px-4 py-3 focus-within:border-cyan-400 transition">
              <Lock className="text-cyan-400" size={18} />
              <input
                type="password"
                placeholder="Repeat password"
                className="bg-transparent outline-none w-full text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-4 rounded-2xl transition shadow-[0_0_30px_rgba(34,211,238,0.45)]"
          >
            Create Adventurer
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-sm">
          Already part of the guild?{" "}
          <a
            href="/login"
            className="text-purple-400 hover:text-purple-300 transition"
          >
            Enter here
          </a>
        </div>
      </section>
    </main>
  );
}