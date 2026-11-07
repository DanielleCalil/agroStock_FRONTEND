import type {
  Insumo,
  Lote,
  Movimentacao,
  RespostaAlertas,
  SaldoInsumo,
  TipoMovimentacao,
  Usuario,
} from "./types";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

/** Erro devolvido pela API (`{"erro": "..."}`) ou falha de rede (status 0). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public dados?: Record<string, unknown>,
  ) {
    super(message);
  }
}

// Chamado quando a sessão expira (401) — o AuthProvider redireciona ao login.
let aoPerderSessao: (() => void) | null = null;
export function definirAoPerderSessao(fn: (() => void) | null) {
  aoPerderSessao = fn;
}

async function requisicao<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch(API_URL + caminho, {
      method: metodo,
      credentials: "include", // envia o cookie de sessão
      headers: corpo !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar à API. Verifique se ela está rodando.");
  }

  if (resp.status === 204) return undefined as T;

  const dados = await resp.json().catch(() => null);
  if (!resp.ok) {
    const publica = caminho === "/sessao" || caminho === "/usuarios" || caminho.startsWith("/senha/");
    if (resp.status === 401 && !publica) aoPerderSessao?.();
    const msg = (dados && typeof dados.erro === "string" && dados.erro) || `Erro ${resp.status}`;
    throw new ApiError(resp.status, msg, dados ?? undefined);
  }
  return dados as T;
}

export const api = {
  login: (login: string, senha: string) => requisicao<Usuario>("POST", "/sessao", { login, senha }),
  cadastrar: (dados: { login: string; email: string; senha: string }) =>
    requisicao<Usuario>("POST", "/usuarios", dados),
  esqueciSenha: (email: string) =>
    requisicao<{ mensagem: string; tokenRedefinicao?: string; expiraEmMinutos?: number }>(
      "POST",
      "/senha/esqueci",
      { email },
    ),
  redefinirSenha: (token: string, novaSenha: string) =>
    requisicao<{ mensagem: string }>("POST", "/senha/redefinir", { token, novaSenha }),
  sessaoAtual: () => requisicao<Usuario>("GET", "/sessao"),
  logout: () => requisicao<void>("DELETE", "/sessao"),

  listarInsumos: () => requisicao<Insumo[]>("GET", "/insumos"),
  criarInsumo: (dados: Omit<Insumo, "id">) => requisicao<Insumo>("POST", "/insumos", dados),

  listarLotes: (insumoId?: number) =>
    requisicao<Lote[]>("GET", insumoId ? `/lotes?insumoId=${insumoId}` : "/lotes"),
  criarLote: (dados: { insumoId: number; codigo: string; validade: string }) =>
    requisicao<Lote>("POST", "/lotes", dados),

  listarMovimentacoes: (
    filtro: { limite?: number; de?: string; loteId?: number; tipo?: TipoMovimentacao } = {},
  ) => {
    const q = new URLSearchParams({ limite: String(filtro.limite ?? 200) });
    if (filtro.de) q.set("de", filtro.de);
    if (filtro.loteId) q.set("loteId", String(filtro.loteId));
    if (filtro.tipo) q.set("tipo", filtro.tipo);
    return requisicao<Movimentacao[]>("GET", `/movimentacoes?${q}`);
  },
  listarSaldos: () => requisicao<SaldoInsumo[]>("GET", "/saldos"),
  registrarMovimentacao: (dados: {
    loteId: number;
    tipo: TipoMovimentacao;
    quantidade: number;
    chaveRequisicao: string;
  }) => requisicao<Movimentacao>("POST", "/movimentacoes", dados),

  alertas: () => requisicao<RespostaAlertas>("GET", "/alertas"),
};

/** Mensagem amigável para exibir na tela. */
export function mensagemErro(e: unknown): string {
  return e instanceof Error ? e.message : "Erro inesperado";
}
