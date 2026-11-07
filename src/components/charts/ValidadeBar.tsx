import type { SaldoInsumo } from "../../lib/types";
import { diasAte } from "../../lib/format";
import { cores } from "./cores";

const faixas = [
  { chave: "vencido", rotulo: "Vencidos", cor: cores.criticoForte, teste: (d: number) => d < 0 },
  { chave: "critico", rotulo: "Até 7 dias", cor: cores.critico, teste: (d: number) => d >= 0 && d <= 7 },
  { chave: "atencao", rotulo: "8 a 30 dias", cor: cores.atencao, teste: (d: number) => d > 7 && d <= 30 },
  { chave: "ok", rotulo: "Mais de 30 dias", cor: cores.ok, teste: (d: number) => d > 30 },
];

/** Barra segmentada: lotes com saldo, por faixa de validade. */
export default function ValidadeBar({ saldos }: { saldos: SaldoInsumo[] }) {
  const dias = saldos.flatMap((s) => s.lotes.filter((l) => l.saldo > 0).map((l) => diasAte(l.validade)));
  const total = dias.length;
  const contagem = faixas.map((f) => ({ ...f, n: dias.filter(f.teste).length }));

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nenhum lote com saldo.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex h-4 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Lotes por faixa de validade">
        {contagem
          .filter((f) => f.n > 0)
          .map((f) => (
            <div
              key={f.chave}
              title={`${f.rotulo}: ${f.n} lote(s)`}
              className="h-full transition-[flex-grow] first:rounded-l-full last:rounded-r-full"
              style={{ flexGrow: f.n, background: f.cor }}
            />
          ))}
      </div>
      <ul className="grid grid-cols-2 gap-3">
        {contagem.map((f) => (
          <li key={f.chave} className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: f.cor }} />
            <span className="text-sm text-muted-foreground">{f.rotulo}</span>
            <span className="ml-auto font-bold tabular-nums">{f.n}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">{total} lote(s) com saldo em estoque</p>
    </div>
  );
}
