export function formatXP(xp: number): string {
  return `${xp.toLocaleString("es-ES")} XP`;
}

export function formatVoidCredits(amount: number): string {
  const n = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
  return n.toLocaleString("es-ES");
}

