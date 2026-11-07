import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowDown, ArrowUp, History, Package } from "lucide-react";
import AppShell from "../components/AppShell";
import Aviso from "../components/Aviso";
import Card from "../components/Card";
import { Esqueleto, Field, PageHeader, Segmented, Select, ValidadeChip, Vazio, campoClass } from "../components/ui";
import { api, ApiError, mensagemErro } from "../lib/api";
import { formatarNumero } from "../lib/format";
import type { TipoMovimentacao } from "../lib/types";
import { useApi } from "../lib/useApi";

const atalhos = [1, 5, 10, 50, 100];

export default function Movimentacao() {
  // Pode chegar pré-selecionado a partir de Cadastros ("Registrar entrada").
  const inicial = (useLocation().state ?? {}) as { insumoId?: number; loteId?: number };
  const insumos = useApi(api.listarInsumos);
  const [insumoId, setInsumoId] = useState(inicial.insumoId ? String(inicial.insumoId) : "");
  const [loteId, setLoteId] = useState(inicial.loteId ? String(inicial.loteId) : "");
  const lotes = useApi(() => (insumoId ? api.listarLotes(Number(insumoId)) : Promise.resolve([])), [insumoId]);
  const ultimas = useApi(
    () => (loteId ? api.listarMovimentacoes({ loteId: Number(loteId), limite: 5 }) : Promise.resolve([])),
    [loteId],
  );
  const [tipo, setTipo] = useState<TipoMovimentacao>(inicial.loteId ? "E" : "S");
  const [quantidade, setQuantidade] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Chave de idempotência: a mesma operação reenviada após falha de rede usa a
  // mesma chave, então a API não registra duas vezes. Muda quando a operação muda.
  const pendente = useRef<{ assinatura: string; chave: string } | null>(null);

  const insumo = insumos.dados?.find((i) => String(i.id) === insumoId);
  const lote = lotes.dados?.find((l) => String(l.id) === loteId);
  const unidade = insumo?.unidade ?? "";
  const qtd = Number(quantidade.replace(",", "."));
  const qtdValida = qtd > 0;
  const saldoApos = lote && qtdValida ? lote.saldo + (tipo === "E" ? qtd : -qtd) : null;
  const insuficiente = saldoApos !== null && saldoApos < 0;
  const entrada = tipo === "E";

  async function registrar() {
    if (enviando) return;
    if (!loteId || !qtdValida) {
      setMsg({ ok: false, t: "Selecione o lote e informe a quantidade." });
      return;
    }

    const assinatura = `${loteId}|${tipo}|${qtd}`;
    if (pendente.current?.assinatura !== assinatura) {
      pendente.current = { assinatura, chave: crypto.randomUUID() };
    }

    setEnviando(true);
    try {
      const mov = await api.registrarMovimentacao({
        loteId: Number(loteId),
        tipo,
        quantidade: qtd,
        chaveRequisicao: pendente.current.chave,
      });
      pendente.current = null;
      const saldo = mov.saldoLote !== undefined ? ` Novo saldo: ${formatarNumero(mov.saldoLote)} ${unidade}.` : "";
      setMsg({ ok: true, t: `${entrada ? "Entrada" : "Saída"} de ${formatarNumero(qtd)} ${unidade} registrada!${saldo}` });
      setQuantidade("");
      lotes.recarregar();
      ultimas.recarregar();
    } catch (e) {
      // Falha de rede (status 0): mantém a chave para um novo clique ser seguro.
      if (!(e instanceof ApiError && e.status === 0)) pendente.current = null;
      const disponivel = e instanceof ApiError ? e.dados?.saldoDisponivel : undefined;
      setMsg({
        ok: false,
        t:
          typeof disponivel === "number"
            ? `Saldo insuficiente no lote (disponível: ${formatarNumero(disponivel)}).`
            : mensagemErro(e),
      });
    } finally {
      setEnviando(false);
    }
  }

  const erroCarga = insumos.erro ?? lotes.erro;

  return (
    <AppShell largo>
      <div className="space-y-6 p-4 md:p-8">
        <PageHeader titulo="Movimentação" subtitulo="Registre entradas e saídas de estoque por lote" />

        {erroCarga && <Aviso ok={false}>{erroCarga}</Aviso>}

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Formulário */}
          <Card className="lg:col-span-3">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                registrar();
              }}
            >
              <Segmented
                valor={tipo}
                onChange={(t) => {
                  setTipo(t);
                  setMsg(null);
                }}
                opcoes={[
                  {
                    valor: "E",
                    rotulo: (
                      <>
                        <ArrowUp className="h-4 w-4 text-primary" /> Entrada
                      </>
                    ),
                  },
                  {
                    valor: "S",
                    rotulo: (
                      <>
                        <ArrowDown className="h-4 w-4 text-destructive" /> Saída
                      </>
                    ),
                  },
                ]}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field rotulo="Insumo">
                  <Select
                    value={insumoId}
                    onChange={(e) => {
                      setInsumoId(e.target.value);
                      setLoteId("");
                      setMsg(null);
                    }}
                  >
                    <option value="">Selecione o insumo</option>
                    {insumos.dados?.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nome}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field rotulo="Lote">
                  <Select
                    value={loteId}
                    onChange={(e) => {
                      setLoteId(e.target.value);
                      setMsg(null);
                    }}
                    disabled={!insumoId}
                  >
                    <option value="">
                      {insumoId && lotes.dados?.length === 0 ? "Nenhum lote cadastrado" : "Selecione o lote"}
                    </option>
                    {lotes.dados?.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.codigo} · saldo {formatarNumero(l.saldo)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field rotulo="Quantidade">
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className={`${campoClass} py-4 pr-20 text-center text-3xl font-extrabold tabular-nums`}
                  />
                  {unidade && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">
                      {unidade}
                    </span>
                  )}
                </div>
              </Field>

              <div className="flex flex-wrap gap-2">
                {atalhos.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuantidade(String((qtdValida ? qtd : 0) + n))}
                    className="rounded-full border bg-background px-3 py-1 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    +{n}
                  </button>
                ))}
                {quantidade && (
                  <button
                    type="button"
                    onClick={() => setQuantidade("")}
                    className="rounded-full px-3 py-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {lote && saldoApos !== null && (
                <div
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm ${
                    insuficiente ? "bg-critical-soft text-critical-foreground" : "bg-secondary"
                  }`}
                >
                  <span className="font-semibold">
                    {insuficiente ? "Saldo insuficiente para esta saída" : "Saldo após a operação"}
                  </span>
                  <span className="font-extrabold tabular-nums">
                    {formatarNumero(lote.saldo)} → {formatarNumero(saldoApos)} {unidade}
                  </span>
                </div>
              )}

              {msg && <Aviso ok={msg.ok}>{msg.t}</Aviso>}

              <button
                disabled={enviando || insuficiente}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-extrabold shadow-md transition hover:brightness-95 active:scale-[0.99] disabled:opacity-50 ${
                  entrada
                    ? "bg-primary text-primary-foreground shadow-primary/25"
                    : "bg-destructive text-destructive-foreground shadow-destructive/25"
                }`}
              >
                {entrada ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                {enviando
                  ? "Registrando..."
                  : `Registrar ${entrada ? "entrada" : "saída"}${qtdValida ? ` de ${formatarNumero(qtd)} ${unidade}` : ""}`}
              </button>
            </form>
          </Card>

          {/* Detalhes do lote */}
          <div className="space-y-6 lg:col-span-2">
            <Card titulo="Lote selecionado">
              {!lote ? (
                <Vazio
                  icone={<Package className="h-6 w-6" />}
                  titulo="Nenhum lote selecionado"
                  texto="Escolha o insumo e o lote para ver o saldo e a validade."
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{insumo?.nome}</p>
                    <p className="text-lg font-bold">Lote {lote.codigo}</p>
                  </div>
                  <div className="rounded-xl bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-muted-foreground">Saldo atual</p>
                    <p className="text-4xl font-extrabold tabular-nums">
                      {formatarNumero(lote.saldo)} <span className="text-lg text-muted-foreground">{unidade}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Validade</span>
                    <ValidadeChip validade={lote.validade} />
                  </div>
                  {insumo && insumo.minimo > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estoque mínimo do insumo</span>
                      <span className="font-semibold">
                        {formatarNumero(insumo.minimo)} {unidade}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {lote && (
              <Card titulo="Últimas movimentações" subtitulo="Deste lote">
                {!ultimas.dados ? (
                  <Esqueleto className="h-24" />
                ) : ultimas.dados.length === 0 ? (
                  <Vazio icone={<History className="h-6 w-6" />} titulo="Sem movimentações ainda" />
                ) : (
                  <ul className="divide-y">
                    {ultimas.dados.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 py-2.5 text-sm">
                        <span
                          className={`rounded-full p-1.5 ${
                            m.tipo === "E" ? "bg-primary/10 text-primary" : "bg-critical-soft text-critical-foreground"
                          }`}
                        >
                          {m.tipo === "E" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">
                            {m.tipo === "E" ? "+" : "−"}
                            {formatarNumero(m.quantidade)} {m.unidade}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {new Date(m.instante).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} ·{" "}
                            {m.usuarioLogin}
                          </p>
                        </div>
                        {m.saldoLote !== undefined && (
                          <span className="text-xs font-semibold text-muted-foreground">
                            saldo {formatarNumero(m.saldoLote)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
