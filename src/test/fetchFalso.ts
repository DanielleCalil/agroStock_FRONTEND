import { vi } from "vitest";

export type Rota = { status: number; corpo?: unknown } | (() => Promise<never>);

/**
 * Substitui o fetch global. `rotas` mapeia "METODO /caminho" (sem query) para a resposta.
 * Devolve o mock para inspecionar as chamadas.
 */
export function fetchFalso(rotas: Record<string, Rota | Rota[]>) {
  const filas = new Map(Object.entries(rotas).map(([k, v]) => [k, Array.isArray(v) ? [...v] : v]));
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    const caminho = new URL(url).pathname;
    const chave = `${init?.method ?? "GET"} ${caminho}`;
    let r = filas.get(chave);
    if (Array.isArray(r)) r = r.length > 1 ? r.shift()! : r[0];
    if (!r) return new Response(JSON.stringify({ erro: "não autenticado" }), { status: 401 });
    if (typeof r === "function") return r();
    return new Response(r.status === 204 ? null : JSON.stringify(r.corpo ?? {}), { status: r.status });
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

export const falhaDeRede: Rota = () => Promise.reject(new TypeError("Failed to fetch"));

/** Corpo JSON enviado na n-ésima chamada a `chave`. */
export function corpos(mock: ReturnType<typeof fetchFalso>, chave: string) {
  return mock.mock.calls
    .filter(([url, init]) => `${init?.method ?? "GET"} ${new URL(url).pathname}` === chave)
    .map(([, init]) => JSON.parse(String(init?.body)));
}
