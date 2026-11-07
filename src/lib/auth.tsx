import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api, definirAoPerderSessao } from "./api";
import type { Usuario } from "./types";

interface AuthCtx {
  usuario: Usuario | null;
  verificando: boolean;
  entrar: (login: string, senha: string) => Promise<void>;
  cadastrar: (dados: { login: string; email: string; senha: string }) => Promise<void>;
  sair: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);

  // Ao abrir o app, pergunta à API se o cookie de sessão ainda vale.
  useEffect(() => {
    api
      .sessaoAtual()
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setVerificando(false));
  }, []);

  // Sessão expirou no meio do uso: volta para o login.
  useEffect(() => {
    definirAoPerderSessao(() => {
      setUsuario(null);
      navigate("/login", { replace: true });
    });
    return () => definirAoPerderSessao(null);
  }, [navigate]);

  const entrar = useCallback(async (login: string, senha: string) => {
    setUsuario(await api.login(login, senha));
  }, []);

  // Só cria a conta; o login é feito depois, na tela de login.
  const cadastrar = useCallback(async (dados: { login: string; email: string; senha: string }) => {
    await api.cadastrar(dados);
  }, []);

  const sair = useCallback(async () => {
    await api.logout().catch(() => undefined);
    setUsuario(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  return <Ctx.Provider value={{ usuario, verificando, entrar, cadastrar, sair }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}

/** Só renderiza as telas internas com usuário logado. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { usuario, verificando } = useAuth();
  const location = useLocation();
  if (verificando) return null;
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  return <>{children}</>;
}
