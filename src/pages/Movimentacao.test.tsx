import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import Movimentacao from "./Movimentacao";
import { corpos, falhaDeRede, fetchFalso, type Rota } from "../test/fetchFalso";
import { renderizar } from "../test/renderizar";

const base: Record<string, Rota> = {
  "GET /sessao": { status: 200, corpo: { id: 1, login: "maria" } },
  "GET /insumos": {
    status: 200,
    corpo: [{ id: 1, nome: "Semente Milho", categoria: "Sementes", unidade: "kg", minimo: 50 }],
  },
  "GET /lotes": { status: 200, corpo: [{ id: 7, insumoId: 1, codigo: "L-01", validade: "2027-01-10", saldo: 70 }] },
  "GET /movimentacoes": { status: 200, corpo: [] },
};

const sucesso = (saldoLote: number): Rota => ({
  status: 201,
  corpo: {
    id: 1,
    loteId: 7,
    usuarioId: 1,
    tipo: "S",
    quantidade: 30,
    instante: "2026-11-24T20:00:00",
    motivo: null,
    chaveRequisicao: "x",
    saldoLote,
  },
});

async function montar(movs: Rota | Rota[]) {
  const f = fetchFalso({ ...base, "POST /movimentacoes": movs });
  const { user } = renderizar(<Movimentacao />);
  await screen.findByRole("option", { name: "Semente Milho" });
  await user.selectOptions(screen.getByLabelText("Insumo"), "1");
  await screen.findByRole("option", { name: /L-01/ });
  await user.selectOptions(screen.getByLabelText("Lote"), "7");
  return { f, user };
}

const botao = () => screen.getByRole("button", { name: /^Registrar/ });

describe("Movimentação", () => {
  it("F22 mostra a prévia do saldo e bloqueia saída maior que o saldo", async () => {
    const { user } = await montar(sucesso(0));
    await user.type(screen.getByPlaceholderText("0"), "100");
    expect(screen.getByText("Saldo insuficiente para esta saída")).toBeInTheDocument();
    expect(screen.getByText(/70 → -30/)).toBeInTheDocument();
    expect(botao()).toBeDisabled();
  });

  it("F23 saída válida envia a operação e exibe o novo saldo", async () => {
    const { f, user } = await montar(sucesso(40));
    await user.type(screen.getByPlaceholderText("0"), "30");
    expect(screen.getByText(/70 → 40/)).toBeInTheDocument();
    await user.click(botao());
    expect(await screen.findByText("Saída de 30 kg registrada! Novo saldo: 40 kg.")).toBeInTheDocument();
    const [c] = corpos(f, "POST /movimentacoes");
    expect(c).toMatchObject({ loteId: 7, tipo: "S", quantidade: 30 });
    expect(c.chaveRequisicao).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("F24 após falha de rede, o reenvio usa a MESMA chave de idempotência", async () => {
    const { f, user } = await montar([falhaDeRede, sucesso(40)]);
    await user.type(screen.getByPlaceholderText("0"), "30");
    await user.click(botao());
    expect(await screen.findByText(/Não foi possível conectar/)).toBeInTheDocument();
    await user.click(botao());
    await screen.findByText(/registrada!/);
    const [a, b] = corpos(f, "POST /movimentacoes");
    expect(b.chaveRequisicao).toBe(a.chaveRequisicao);
  });

  it("F25 uma nova operação (após sucesso) gera chave nova", async () => {
    const { f, user } = await montar(sucesso(40));
    const campo = screen.getByPlaceholderText("0");
    await user.type(campo, "30");
    await user.click(botao());
    await screen.findByText(/registrada!/);
    await user.type(campo, "30");
    await user.click(botao());
    const [a, b] = corpos(f, "POST /movimentacoes");
    expect(b.chaveRequisicao).not.toBe(a.chaveRequisicao);
  });

  it("F26 409 de saldo insuficiente (concorrência) mostra o saldo disponível", async () => {
    const { user } = await montar({
      status: 409,
      corpo: { erro: "saldo insuficiente no lote", saldoDisponivel: 12.5 },
    });
    await user.type(screen.getByPlaceholderText("0"), "20");
    await user.click(botao());
    expect(await screen.findByText("Saldo insuficiente no lote (disponível: 12,5).")).toBeInTheDocument();
  });
});
