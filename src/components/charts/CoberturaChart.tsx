import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SaldoInsumo } from "../../lib/types";
import { formatarNumero } from "../../lib/format";
import { cores } from "./cores";
import { Dica } from "./Dica";

const TETO = 200; // % máximo desenhado; o valor real aparece no rótulo

interface Linha {
  nome: string;
  pct: number;
  desenho: number;
  abaixo: boolean;
  saldo: number;
  minimo: number;
  unidade: string;
}

/**
 * Cobertura do estoque mínimo: saldo ÷ mínimo, em %. Usar a razão permite
 * comparar insumos com unidades diferentes (Kg, Litros, Sacas) no mesmo eixo.
 */
export default function CoberturaChart({ saldos }: { saldos: SaldoInsumo[] }) {
  const linhas: Linha[] = saldos
    .filter((s) => s.minimo > 0)
    .map((s) => {
      const pct = (s.saldoTotal / s.minimo) * 100;
      return {
        nome: s.nome,
        pct,
        desenho: Math.min(pct, TETO),
        abaixo: s.abaixoMinimo,
        saldo: s.saldoTotal,
        minimo: s.minimo,
        unidade: s.unidade,
      };
    })
    .sort((a, b) => a.pct - b.pct);

  const semMinimo = saldos.length - linhas.length;

  if (linhas.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nenhum insumo com estoque mínimo definido.</p>;
  }

  return (
    <div className="space-y-2">
      <div style={{ height: linhas.length * 36 + 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={linhas} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, TETO]} hide />
            <YAxis
              type="category"
              dataKey="nome"
              width={150}
              tickLine={false}
              axisLine={false}
              tick={{ fill: cores.eixo, fontSize: 12 }}
            />
            <ReferenceLine
              x={100}
              stroke={cores.eixo}
              strokeOpacity={0.5}
              label={{ value: "mínimo", position: "top", fill: cores.eixo, fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(100,116,139,0.08)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const l = payload[0].payload as Linha;
                return (
                  <Dica
                    titulo={l.nome}
                    linhas={[
                      { rotulo: "Saldo", valor: `${formatarNumero(l.saldo)} ${l.unidade}` },
                      { rotulo: "Mínimo", valor: `${formatarNumero(l.minimo)} ${l.unidade}` },
                      { cor: l.abaixo ? cores.critico : cores.ok, rotulo: "Cobertura", valor: `${Math.round(l.pct)}%` },
                    ]}
                  />
                );
              }}
            />
            <Bar dataKey="desenho" radius={[0, 4, 4, 0]} maxBarSize={18} background={{ fill: "#f1f5f9", radius: 4 }}>
              {linhas.map((l) => (
                <Cell key={l.nome} fill={l.abaixo ? cores.critico : cores.ok} />
              ))}
              <LabelList
                dataKey="pct"
                position="right"
                formatter={(v: number) => `${Math.round(v)}%`}
                style={{ fill: "#334155", fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="mr-1 inline-block h-2 w-2 rounded-sm" style={{ background: cores.critico }} />
        Abaixo do mínimo · a linha marca 100% do mínimo
        {semMinimo > 0 && ` · ${semMinimo} insumo(s) sem mínimo definido`}
      </p>
    </div>
  );
}
