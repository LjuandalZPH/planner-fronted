// app/login/page.tsx
"use client";

import { useLoginForm } from '@/hooks/useLoginForm'; 

export default function LoginPage() {
  const { 
    email, setEmail, 
    password, setPassword, 
    error, isLoading, 
    handleLogin 
  } = useLoginForm();

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
      <form 
        onSubmit={handleLogin} 
        className="p-8 bg-[#1e293b] shadow-2xl rounded-xl w-full max-w-md border border-slate-700"
      >
        <h1 className="text-3xl font-bold mb-2">Iniciar sesión</h1>
        <p className="text-slate-400 mb-8">Pantalla de autenticación del usuario.</p>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-6 text-sm border border-red-500/50">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
            <input
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#0f172a] border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#0f172a] border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all mt-4"
          >
            {isLoading ? 'Verificando...' : 'Entrar'}
          </button>
        </div>
      </form>
    </main>
  );
}