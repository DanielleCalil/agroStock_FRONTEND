import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, Info, Layers, Search, Sprout } from "lucide-react";
import AppShell from "../components/AppShell";
import Aviso from "../components/Aviso";
import Card from "../components/Card";
import { Esqueleto, Field, PageHeader, Segmented, Select, ValidadeChip, Vazio, campoClass } from "../components/ui";
import { api, mensagemErro } from "../lib/api";
import { formatarNumero } from "../lib/format";
import type { Lote, SaldoInsumo } from "../lib/types";
import { useApi } from "../lib/useApi";

type Aba = "insumo" | "lote";
type Msg = { ok: boolean; t: string; lote?: Lote } | null;

const botaoSalvar =
  "w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-md shadow-primary/25 transition hover:brightness-95 active:scale-[0.99] disabled:opacity-50";

export default function Cadastros() {
  const [aba, setAba] = useState<Aba>("insumo");
  // /saldos traz insumos + lotes de uma vez: serve para as duas listas e para o select.
  const saldos = useApi(api.listarSaldos);

  return (
    <AppShell largo>
      <div className="space-y-6 p-4 md:p-8">
        <PageHeader
          titulo="Cadastros"
          subtitulo="Insumos e lotes do estoque"
          acoes={
            <Segmented
              valor={aba}
              onChange={setAba}
              opcoes={[
                { valor: "insumo", rotulo: <><Sprout className="h-4 w-4" /> Novo Insumo</> },
                { valor: "lote", rotulo: <><Layers className="h-4 w-4" /> Novo Lote</> },
              ]}
            />
          }
        />

        {saldos.erro && <Aviso ok={false}>{saldos.erro}</Aviso>}

        <div className="grid gap-6 lg:grid-cols-5">
          <Card
            className="lg:col-span-3"
            titulo={aba === "insumo" ? "Novo insumo" : "Novo lote"}
            subtitulo={aba === "insumo" ? "Produto controlado no estoque" : "Uma remessa do insumo, com código e validade"}
          >
            {aba === "insumo" ? (
              <NovoInsumo saldos={saldos.dados ?? []} aoSalvar={saldos.recarregar} />
            ) : (
              <NovoLote saldos={saldos.dados ?? []} aoSalvar={saldos.recarregar} />
            )}
          </Card>

          <div className="lg:col-span-2">
            {aba === "insumo" ? <ListaInsumos saldos={saldos.dados} /> : <ListaLotes saldos={saldos.dados} />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------- Formulários ---------- */

const unidades = ["Litros", "Kg", "Sacas"];
const insumoVazio = { nome: "", categoria: "", unidade: "Litros", minimo: "" };

function NovoInsumo({ saldos, aoSalvar }: { saldos: SaldoInsumo[]; aoSalvar: () => void }) {
  const [form, setForm] = useState(insumoVazio);
  const [msg, setMsg] = useState<Msg>(null);
  const [enviando, setEnviando] = useState(false);
  const categorias = [...new Set(saldos.map((s) => s.categoria))].sort();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMsg(null);
    try {
      await api.criarInsumo({ ...form, minimo: Number(form.minimo.replace(",", ".")) || 0 });
      setMsg({ ok: true, t: `Insumo "${form.nome.trim()}" salvo!` });
      setForm(insumoVazio);
      aoSalvar();
    } catch (err) {
      setMsg({ ok: false, t: mensagemErro(err) });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field rotulo="Nome">
        <input
          required
          maxLength={100}
          className={campoClass}
          placeholder="Ex.: Fertilizante NPK 10-10-10"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
      </Field>
      <Field rotulo="Categoria" dica={categorias.length > 0 && "Escolha uma existente ou digite uma nova."}>
        <input
          required
          maxLength={50}
          list="categorias"
          className={campoClass}
          placeholder="Ex.: Fertilizantes"
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        />
        <datalist id="categorias">
          {categorias.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-sm font-semibold">Unidade</span>
          <div className="flex gap-2">
            {unidades.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setForm({ ...form, unidade: u })}
                className={`flex-1 rounded-xl border py-3 font-semibold transition ${
                  form.unidade === u
                    ? "border-primary bg-primary/10 text-primary"
                    : "bg-background text-muted-foreground hover:border-primary/50"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <Field rotulo="Estoque mínimo" dica="Abaixo disso o insumo aparece em alerta no Painel.">
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              className={`${campoClass} pr-16`}
              placeholder="0"
              value={form.minimo}
              onChange={(e) => setForm({ ...form, minimo: e.target.value })}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
              {form.unidade}
            </span>
          </div>
        </Field>
      </div>
      {msg && <Aviso ok={msg.ok}>{msg.t}</Aviso>}
      <button className={botaoSalvar} disabled={enviando}>
        {enviando ? "Salvando..." : "Salvar insumo"}
      </button>
    </form>
  );
}

const loteVazio = { insumoId: "", codigo: "", validade: "" };

function NovoLote({ saldos, aoSalvar }: { saldos: SaldoInsumo[]; aoSalvar: () => void }) {
  const [form, setForm] = useState(loteVazio);
  const [msg, setMsg] = useState<Msg>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMsg(null);
    try {
      const lote = await api.criarLote({ ...form, insumoId: Number(form.insumoId) });
      setMsg({ ok: true, t: `Lote ${lote.codigo} salvo!`, lote });
      setForm(loteVazio);
      aoSalvar();
    } catch (err) {
      setMsg({ ok: false, t: mensagemErro(err) });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field rotulo="Insumo">
        <Select required value={form.insumoId} onChange={(e) => setForm({ ...form, insumoId: e.target.value })}>
          <option value="">Selecione o insumo</option>
          {saldos.map((s) => (
            <option key={s.insumoId} value={s.insumoId}>
              {s.nome}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field rotulo="Código do lote">
          <input
            required
            maxLength={50}
            className={campoClass}
            placeholder="Ex.: NPK-554"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
        </Field>
        <Field rotulo="Data de validade">
          <input
            required
            type="date"
            className={campoClass}
            value={form.validade}
            onChange={(e) => setForm({ ...form, validade: e.target.value })}
          />
        </Field>
      </div>
      <p className="flex items-start gap-2 rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        O lote nasce com saldo 0. Depois de salvar, registre a entrada do estoque em Movimentar.
      </p>
      {msg && (
        <div className="space-y-2">
          <Aviso ok={msg.ok}>{msg.t}</Aviso>
          {msg.lote && (
            <Link
              to="/movimentacao"
              state={{ insumoId: msg.lote.insumoId, loteId: msg.lote.id }}
              className="flex items-center justify-center gap-2 rounded-xl border border-primary py-2.5 font-bold text-primary transition hover:bg-primary/5"
            >
              Registrar entrada deste lote <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
      <button className={botaoSalvar} disabled={enviando}>
        {enviando ? "Salvando..." : "Salvar lote"}
      </button>
    </form>
  );
}

/* ---------- Listas ---------- */

function Busca({ valor, onChange, placeholder }: { valor: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mb-3">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${campoClass} py-2 pl-9 text-sm`}
      />
    </div>
  );
}

function ListaInsumos({ saldos }: { saldos: SaldoInsumo[] | null }) {
  const [busca, setBusca] = useState("");
  const itens = (saldos ?? []).filter((s) => `${s.nome} ${s.categoria}`.toLowerCase().includes(busca.toLowerCase()));

  return (
    <Card titulo="Insumos cadastrados" subtitulo={saldos ? `${saldos.length} no total` : undefined}>
      {!saldos ? (
        <Esqueleto />
      ) : saldos.length === 0 ? (
        <Vazio icone={<Boxes className="h-6 w-6" />} titulo="Nenhum insumo ainda" texto="Cadastre o primeiro ao lado." />
      ) : (
        <>
          <Busca valor={busca} onChange={setBusca} placeholder="Buscar insumo ou categoria" />
          <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {itens.map((s) => (
              <li key={s.insumoId} className="rounded-xl border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{s.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.categoria} · {s.lotes.length} lote(s)
                    </p>
                  </div>
                  {s.abaixoMinimo && (
                    <span className="shrink-0 rounded-full bg-critical-soft px-2.5 py-0.5 text-xs font-bold text-critical-foreground">
                      Abaixo do mínimo
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-extrabold tabular-nums">{formatarNumero(s.saldoTotal)}</span>{" "}
                  <span className="text-muted-foreground">
                    {s.unidade}
                    {s.minimo > 0 && ` · mínimo ${formatarNumero(s.minimo)}`}
                  </span>
                </p>
              </li>
            ))}
            {itens.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Nada encontrado.</p>}
          </ul>
        </>
      )}
    </Card>
  );
}

function ListaLotes({ saldos }: { saldos: SaldoInsumo[] | null }) {
  const [busca, setBusca] = useState("");
  const lotes = (saldos ?? [])
    .flatMap((s) => s.lotes.map((l) => ({ ...l, insumo: s.nome, unidade: s.unidade })))
    .sort((a, b) => a.validade.localeCompare(b.validade));
  const itens = lotes.filter((l) => `${l.codigo} ${l.insumo}`.toLowerCase().includes(busca.toLowerCase()));

  return (
    <Card titulo="Lotes cadastrados" subtitulo={saldos ? `${lotes.length} no total · por validade` : undefined}>
      {!saldos ? (
        <Esqueleto />
      ) : lotes.length === 0 ? (
        <Vazio icone={<Layers className="h-6 w-6" />} titulo="Nenhum lote ainda" texto="Cadastre o primeiro ao lado." />
      ) : (
        <>
          <Busca valor={busca} onChange={setBusca} placeholder="Buscar lote ou insumo" />
          <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {itens.map((l) => (
              <li key={l.loteId} className="rounded-xl border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold">Lote {l.codigo}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.insumo}</p>
                  </div>
                  <ValidadeChip validade={l.validade} />
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-extrabold tabular-nums">{formatarNumero(l.saldo)}</span>{" "}
                  <span className="text-muted-foreground">{l.unidade}</span>
                </p>
              </li>
            ))}
            {itens.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Nada encontrado.</p>}
          </ul>
        </>
      )}
    </Card>
  );
}
