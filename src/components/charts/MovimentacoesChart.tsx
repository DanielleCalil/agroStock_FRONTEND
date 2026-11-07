import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Movimentacao } from "../../lib/types";
import { dataISO, diaRelativo } from "../../lib/format";
import { cores } from "./cores";
import { Dica, Legenda } from "./Dica";

export const DIAS_GRAFICO = 14;

interface Ponto {
  dia: string; // AAAA-MM-DD
  rotulo: string; // dd/mm
  entradas: number;
  saidas: number;
}

/**
 * Quantidade de movimentações (não de produto: as unidades são diferentes
 * entre insumos e não podem ser somadas) por dia, nos últimos 14 dias.
 */
function agrupar(movs: Movimentacao[]): Ponto[] {
  const pontos: Ponto[] = [];
  const porDia = new Map<string, Ponto>();
  for (let i = DIAS_GRAFICO - 1; i >= 0; i--) {
    const d = diaRelativo(-i);
    const p = {
      dia: dataISO(d),
      rotulo: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      entradas: 0,
      saidas: 0,
    };
    pontos.push(p);
    porDia.set(p.dia, p);
  }
  for (const m of movs) {
    const p = porDia.get(m.instante.slice(0, 10));
    if (!p) continue;
    if (m.tipo === "E") p.entradas++;
    else p.saidas++;
  }
  return pontos;
}

export default function MovimentacoesChart({ movs }: { movs: Movimentacao[] }) {
  const dados = agrupar(movs);
  const vazio = dados.every((p) => p.entradas === 0 && p.saidas === 0);

  return (
    <div className="space-y-3">
      <Legenda
        itens={[
          { cor: cores.entrada, rotulo: "Entradas" },
          { cor: cores.saida, rotulo: "Saídas" },
        ]}
      />
      <div className="relative h-60">
        {vazio && (
          <p className="absolute inset-0 z-10 flex items-center justify-center text-sm text-muted-foreground">
            Nenhuma movimentação no período.
          </p>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} barGap={2} barCategoryGap="25%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={cores.grade} />
            <XAxis
              dataKey="rotulo"
              tickLine={false}
              axisLine={{ stroke: cores.grade }}
              tick={{ fill: cores.eixo, fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={12}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: cores.eixo, fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(100,116,139,0.08)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as Ponto;
                return (
                  <Dica
                    titulo={p.rotulo}
                    linhas={[
                      { cor: cores.entrada, rotulo: "Entradas", valor: p.entradas },
                      { cor: cores.saida, rotulo: "Saídas", valor: p.saidas },
                    ]}
                  />
                );
              }}
            />
            <Bar dataKey="entradas" name="Entradas" fill={cores.entrada} radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar dataKey="saidas" name="Saídas" fill={cores.saida} radius={[4, 4, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
