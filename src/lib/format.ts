/** Número no formato brasileiro, com até 3 casas decimais. */
export function formatarNumero(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}

/** Data local no formato AAAA-MM-DD. */
export function dataISO(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Hoje (meia-noite local) somado de `dias`. */
export function diaRelativo(dias: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  return d;
}

/** Dias de hoje até a data AAAA-MM-DD (negativo = já passou). */
export function diasAte(dataAAAAMMDD: string): number {
  const [a, m, d] = dataAAAAMMDD.split("-").map(Number);
  return Math.round((new Date(a, m - 1, d).getTime() - diaRelativo(0).getTime()) / 86_400_000);
}
