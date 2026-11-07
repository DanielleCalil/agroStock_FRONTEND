import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { Erro, Toast, botaoLaranja, linkVerde } from "../components/AuthLayout";
import { Field, campoClass } from "../components/ui";
import { mensagemErro } from "../lib/api";
import { useAuth } from "../lib/auth";

/** Estado que outras telas podem passar ao navegar para o login. */
export type EstadoLogin = { de?: string; aviso?: string; login?: string } | null;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, verificando, entrar } = useAuth();
  const estado = location.state as EstadoLogin;
  const [login, setLogin] = useState(estado?.login ?? "");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const destino = estado?.de ?? "/painel";

  if (!verificando && usuario) return <Navigate to={destino} replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!login.trim() || !senha) {
      setErro("Informe o usuário (ou e-mail) e a senha.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await entrar(login.trim(), senha);
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Login" subtitulo="Digite seu usuário ou e-mail e a senha para entrar no AgroStock." onSubmit={handleSubmit}>
      {estado?.aviso && !erro && <Toast>{estado.aviso}</Toast>}
      {erro && <Erro>{erro}</Erro>}

      <Field rotulo="Usuário ou e-mail">
        <input
          className={campoClass}
          placeholder="Digite seu usuário ou e-mail"
          autoComplete="username"
          maxLength={255}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
      </Field>
      <Field rotulo="Senha">
        <input
          className={campoClass}
          type="password"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          autoFocus={!!estado?.login}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </Field>

      <button className={botaoLaranja} disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>

      <div className="flex flex-col items-center gap-2 pt-1 text-sm">
        <Link to="/esqueci-senha" className={linkVerde}>
          Esqueci minha senha
        </Link>
        <p className="text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/cadastro" className={linkVerde}>
            Cadastre-se
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
