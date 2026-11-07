import type { LucideIcon } from "lucide-react";

type Tom = "neutro" | "atencao" | "critico" | "ok";

const estilos: Record<Tom, { caixa: string; icone: string }> = {
  neutro: { caixa: "bg-card", icone: "bg-secondary text-foreground" },
  ok: { caixa: "bg-card", icone: "bg-primary/10 text-primary" },
  atencao: { caixa: "bg-attention-soft border-attention/40", icone: "bg-attention/20 text-attention-foreground" },
  critico: { caixa: "bg-critical-soft border-critical/40", icone: "bg-critical/15 text-critical-foreground" },
};

/** Indicador numérico: ícone + valor + rótulo (+ detalhe opcional). */
export default function StatTile({
  icone: Icone,
  valor,
  rotulo,
  detalhe,
  tom = "neutro",
}: {
  icone: LucideIcon;
  valor: number | string;
  rotulo: string;
  detalhe?: string;
  tom?: Tom;
}) {
  const e = estilos[tom];
  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${e.caixa}`}>
      <div className={`inline-flex rounded-xl p-2 ${e.icone}`}>
        <Icone className="h-5 w-5" />
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums">{valor}</p>
      <p className="text-sm font-semibold">{rotulo}</p>
      {detalhe && <p className="mt-0.5 text-xs text-muted-foreground">{detalhe}</p>}
    </div>
  );
}
