import { useState } from "react";
import { ArrowDown, ArrowUp, History, Search } from "lucide-react";
import AppShell from "../components/AppShell";
import Aviso from "../components/Aviso";
import { Esqueleto, PageHeader, Segmented, Vazio, campoClass } from "../components/ui";
import { api } from "../lib/api";
import { dataISO, diaRelativo, formatarNumero } from "../lib/format";
import type { Movimentacao, TipoMovimentacao } from "../lib/types";
import { useApi } from "../lib/useApi";

type FiltroTipo = "todos" | TipoMovimentacao;
const periodos = [
  { valor: 7, rotulo: "7 dias" },
  { valor: 30, rotulo: "30 dias" },
  { valor: 90, rotulo: "90 dias" },
  { valor: 0, rotulo: "Tudo" },
];

function rotuloDia(dia: string) {
  if (dia === dataISO(diaRelativo(0))) return "Hoje";
  if (dia === dataISO(diaRelativo(-1))) return "Ontem";
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

export default function Historico() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [periodo, setPeriodo] = useState(30);

  // Tipo e período vão para a API; a busca por texto filtra no navegador.
  const { dados, erro, carregando } = useApi(
    () =>
      api.listarMovimentacoes({
        limite: 500,
        tipo: tipo === "todos" ? undefined : tipo,
        de: periodo ? dataISO(diaRelativo(-(periodo - 1))) : undefined,
      }),
    [tipo, periodo],
  );

  const termo = busca.toLowerCase();
  const itens = (dados ?? []).filter((m) =>
    `${m.insumoNome} ${m.loteCodigo} ${m.usuarioLogin} ${m.motivo ?? ""}`.toLowerCase().includes(termo),
  );
  const entradas = itens.filter((m) => m.tipo === "E").length;
  const saidas = itens.length - entradas;

  // Agrupa por dia, mantendo a ordem (mais recentes primeiro).
  const grupos: { dia: string; movs: Movimentacao[] }[] = [];
  for (const m of itens) {
    const dia = m.instante.slice(0, 10);
    let ultimo = grupos[grupos.length - 1];
    if (ultimo?.dia !== dia) grupos.push((ultimo = { dia, movs: [] }));
    ultimo.movs.push(m);
  }

  return (
    <AppShell largo>
      <div className="sticky top-0 z-10 space-y-4 border-b bg-background/85 p-4 backdrop-blur md:px-8 md:pt-8">
        <PageHeader
          titulo="Histórico"
          subtitulo="Todas as entradas e saídas registradas"
          acoes={
            dados && (
              <div className="flex gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
                  <ArrowUp className="h-3.5 w-3.5" /> {entradas} entrada(s)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-critical-soft px-3 py-1 font-bold text-critical-foreground">
                  <ArrowDown className="h-3.5 w-3.5" /> {saidas} saída(s)
                </span>
              </div>
            )
          }
        />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar insumo, lote ou autor"
              className={`${campoClass} bg-card py-2.5 pl-10`}
            />
          </div>
          <Segmented<FiltroTipo>
            tamanho="sm"
            valor={tipo}
            onChange={setTipo}
            opcoes={[
              { valor: "todos", rotulo: "Todos" },
              { valor: "E", rotulo: "Entradas" },
              { valor: "S", rotulo: "Saídas" },
            ]}
          />
          <Segmented tamanho="sm" valor={periodo} onChange={setPeriodo} opcoes={periodos} />
        </div>
      </div>

      <div className="space-y-6 p-4 md:px-8">
        {erro && <Aviso ok={false}>{erro}</Aviso>}
        {carregando && !dados && (
          <div className="space-y-2">
            <Esqueleto className="h-16" />
            <Esqueleto className="h-16" />
            <Esqueleto className="h-16" />
          </div>
        )}

        {dados && itens.length === 0 && (
          <Vazio
            icone={<History className="h-6 w-6" />}
            titulo="Nada encontrado"
            texto={busca ? "Tente outro termo de busca." : "Nenhuma movimentação neste período."}
          />
        )}

        {grupos.map((g) => (
          <section key={g.dia} className="space-y-2">
            <h2 className="text-sm font-bold capitalize text-muted-foreground">
              {rotuloDia(g.dia)} <span className="font-semibold normal-case">· {g.movs.length}</span>
            </h2>
            <ul className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              {g.movs.map((m) => {
                const entrada = m.tipo === "E";
                return (
                  <li key={m.id} className="flex items-center gap-3 border-b p-3 transition last:border-b-0 hover:bg-secondary/50 md:p-4">
                    <div
                      className={`rounded-xl p-2.5 ${
                        entrada ? "bg-primary/10 text-primary" : "bg-critical-soft text-critical-foreground"
                      }`}
                    >
                      {entrada ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{m.insumoNome}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(m.instante).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · Lote{" "}
                        {m.loteCodigo} · {m.usuarioLogin}
                        {m.motivo && ` · ${m.motivo}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-extrabold tabular-nums ${entrada ? "text-primary" : "text-critical-foreground"}`}>
                        {entrada ? "+" : "−"}
                        {formatarNumero(m.quantidade)} <span className="text-xs font-semibold">{m.unidade}</span>
                      </p>
                      {m.saldoLote !== undefined && (
                        <p className="text-xs text-muted-foreground">saldo {formatarNumero(m.saldoLote)}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {dados && dados.length === 500 && (
          <p className="text-center text-xs text-muted-foreground">
            Mostrando as 500 movimentações mais recentes do período. Reduza o período para ver mais detalhes.
          </p>
        )}
      </div>
    </AppShell>
  );
}
