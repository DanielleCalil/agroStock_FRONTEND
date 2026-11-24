import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, definirAoPerderSessao } from "./api";
import { falhaDeRede, fetchFalso } from "../test/fetchFalso";

describe("cliente da API", () => {
  afterEach(() => definirAoPerderSessao(null));

  it("F04 envia o cookie de sessão e JSON no corpo", async () => {
    const f = fetchFalso({ "POST /sessao": { status: 200, corpo: { id: 1, login: "ana" } } });
    expect(await api.login("ana", "segredo123")).toEqual({ id: 1, login: "ana" });
    const [, init] = f.mock.calls[0];
    expect(init?.credentials).toBe("include");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init?.body))).toEqual({ login: "ana", senha: "segredo123" });
  });

  it("F05 converte {erro} da API em ApiError com status e dados", async () => {
    fetchFalso({
      "POST /movimentacoes": { status: 409, corpo: { erro: "saldo insuficiente no lote", saldoDisponivel: 70 } },
    });
    const e = await api
      .registrarMovimentacao({ loteId: 1, tipo: "S", quantidade: 1000, chaveRequisicao: "k" })
      .catch((x) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect(e.status).toBe(409);
    expect(e.message).toBe("saldo insuficiente no lote");
    expect(e.dados.saldoDisponivel).toBe(70);
  });

  it("F06 falha de rede vira ApiError status 0 com mensagem amigável", async () => {
    fetchFalso({ "GET /insumos": falhaDeRede });
    const e = await api.listarInsumos().catch((x) => x);
    expect(e.status).toBe(0);
    expect(e.message).toMatch(/Não foi possível conectar/);
  });

  it("F07 401 em rota protegida dispara o redirecionamento ao login", async () => {
    const perdeu = vi.fn();
    definirAoPerderSessao(perdeu);
    fetchFalso({});
    await api.listarSaldos().catch(() => undefined);
    expect(perdeu).toHaveBeenCalledOnce();
  });

  it("F08 401 no login (senha errada) NÃO dispara o redirecionamento", async () => {
    const perdeu = vi.fn();
    definirAoPerderSessao(perdeu);
    fetchFalso({ "POST /sessao": { status: 401, corpo: { erro: "login ou senha inválidos" } } });
    await expect(api.login("ana", "errada123")).rejects.toThrow("login ou senha inválidos");
    expect(perdeu).not.toHaveBeenCalled();
  });

  it("F09 204 (logout) resolve sem tentar ler JSON", async () => {
    fetchFalso({ "DELETE /sessao": { status: 204 } });
    await expect(api.logout()).resolves.toBeUndefined();
  });

  it("F10 monta a query do histórico com os filtros informados", async () => {
    const f = fetchFalso({ "GET /movimentacoes": { status: 200, corpo: [] } });
    await api.listarMovimentacoes({ loteId: 3, tipo: "S", de: "2026-11-01", limite: 5 });
    const q = new URL(f.mock.calls[0][0] as string).searchParams;
    expect(Object.fromEntries(q)).toEqual({ limite: "5", loteId: "3", tipo: "S", de: "2026-11-01" });
  });
});
