import { Link } from "react-router-dom";
import { ArrowLeftRight, ChevronRight, Clock, LogOut, PackageX, RefreshCw, TriangleAlert } from "lucide-react";
import AppShell from "../components/AppShell";
import Aviso from "../components/Aviso";
import Card from "../components/Card";
import StatTile from "../components/StatTile";
import CoberturaChart from "../components/charts/CoberturaChart";
import MovimentacoesChart, { DIAS_GRAFICO } from "../components/charts/MovimentacoesChart";
import ValidadeBar from "../components/charts/ValidadeBar";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { dataISO, diaRelativo, formatarNumero } from "../lib/format";
import { useApi } from "../lib/useApi";

function textoVencimento(dias: number) {
  if (dias < 0) return `Vencido há ${-dias} dia(s)`;
  if (dias === 0) return "Vence hoje";
  return `Vence em ${dias} dia(s)`;
}

export default function Painel() {
  const { usuario, sair } = useAuth();
  const alertas = useApi(api.alertas);
  const saldos = useApi(api.listarSaldos);
  const movs = useApi(() => api.listarMovimentacoes({ limite: 500, de: dataISO(diaRelativo(-(DIAS_GRAFICO - 1))) }));

  const lista = alertas.dados?.alertas ?? [];
  const criticos = lista.filter((a) => a.nivel === "vermelho");
  const atencao = lista.filter((a) => a.nivel === "amarelo");
  const abaixoMinimo = saldos.dados?.filter((s) => s.abaixoMinimo).length ?? 0;
  const movsSemana = movs.dados?.filter((m) => m.instante.slice(0, 10) >= dataISO(diaRelativo(-6))).length ?? 0;

  const carregou = alertas.dados && saldos.dados && movs.dados;
  const n = (v: number) => (carregou ? v : "–");
  const erro = alertas.erro ?? saldos.erro ?? movs.erro;

  function atualizar() {
    alertas.recarregar();
    saldos.recarregar();
    movs.recarregar();
  }

  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <AppShell largo>
      <div className="space-y-6 p-4 md:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold capitalize text-muted-foreground">{hoje}</p>
            <h1 className="text-2xl font-extrabold md:text-3xl">Olá, {usuario?.login}! 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={atualizar}
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-semibold shadow-sm transition hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" /> Atualizar
            </button>
            <Link
              to="/movimentacao"
              className="hidden items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 transition hover:brightness-95 sm:inline-flex"
            >
              <ArrowLeftRight className="h-4 w-4" /> Movimentar
            </Link>
            <button
              onClick={sair}
              aria-label="Sair"
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-secondary md:hidden"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {erro && <Aviso ok={false}>{erro}</Aviso>}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icone={Clock} tom="atencao" valor={n(atencao.length)} rotulo="Atenção (30 dias)" detalhe="Lotes vencendo em 8 a 30 dias" />
          <StatTile icone={TriangleAlert} tom="critico" valor={n(criticos.length)} rotulo="Críticos/Vencidos" detalhe="Até 7 dias ou já vencidos" />
          <StatTile
            icone={PackageX}
            tom={abaixoMinimo > 0 ? "critico" : "ok"}
            valor={n(abaixoMinimo)}
            rotulo="Abaixo do mínimo"
            detalhe={`de ${saldos.dados?.length ?? "–"} insumo(s)`}
          />
          <StatTile icone={ArrowLeftRight} valor={n(movsSemana)} rotulo="Movimentações" detalhe="Últimos 7 dias" />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card
            className="lg:col-span-3"
            titulo="Movimentações por dia"
            subtitulo={`Quantidade de entradas e saídas nos últimos ${DIAS_GRAFICO} dias`}
          >
            {movs.dados ? <MovimentacoesChart movs={movs.dados} /> : <Carregando />}
          </Card>
          <Card className="lg:col-span-2" titulo="Validade dos lotes" subtitulo="Lotes com saldo, por prazo de vencimento">
            {saldos.dados ? <ValidadeBar saldos={saldos.dados} /> : <Carregando />}
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3" titulo="Cobertura do estoque mínimo" subtitulo="Saldo atual em relação ao mínimo de cada insumo">
            {saldos.dados ? <CoberturaChart saldos={saldos.dados} /> : <Carregando />}
          </Card>

          <Card
            className="lg:col-span-2"
            titulo="Alertas críticos"
            subtitulo="Vencidos ou vencendo em até 7 dias"
            acao={
              <Link to="/historico" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
                Histórico <ChevronRight className="h-4 w-4" />
              </Link>
            }
          >
            {!alertas.dados && <Carregando />}
            {alertas.dados && criticos.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhum alerta no momento. 🌱</p>
            )}
            <ul className="space-y-2">
              {criticos.map((a) => (
                <li
                  key={a.loteId}
                  className="flex items-center gap-3 rounded-xl border border-critical/20 bg-critical-soft/50 p-3"
                >
                  <span className="rounded-lg bg-critical/15 p-2 text-critical-foreground">
                    <TriangleAlert className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{a.insumoNome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Lote {a.loteCodigo} · {formatarNumero(a.saldo)} {a.unidade}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-card px-2.5 py-1 text-xs font-bold text-critical-foreground">
                    {textoVencimento(a.diasRestantes)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Carregando() {
  return <div className="h-40 animate-pulse rounded-xl bg-secondary" />;
}
