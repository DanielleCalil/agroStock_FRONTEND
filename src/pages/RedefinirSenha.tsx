import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout, { Erro, botaoLaranja, linkVerde } from "../components/AuthLayout";
import { Field, campoClass } from "../components/ui";
import { api, mensagemErro } from "../lib/api";
import type { EstadoLogin } from "./Login";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token, setToken] = useState(params.get("token") ?? "");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token.trim()) return setErro("Informe o token de redefinição.");
    if (senha.length < 8) return setErro("A nova senha deve ter pelo menos 8 caracteres.");
    if (new TextEncoder().encode(senha).length > 72) return setErro("A nova senha deve ter no máximo 72 caracteres.");
    if (senha !== confirmacao) return setErro("As senhas não conferem.");

    setEnviando(true);
    setErro(null);
    try {
      await api.redefinirSenha(token.trim(), senha);
      const estado: EstadoLogin = { aviso: "Senha redefinida com sucesso. Faça login para continuar." };
      navigate("/login", { replace: true, state: estado });
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Redefinir senha" subtitulo="Informe o token recebido e cadastre uma nova senha." onSubmit={handleSubmit}>
      {erro && <Erro>{erro}</Erro>}

      <Field rotulo="Token">
        <input
          className={campoClass}
          placeholder="Cole o token de redefinição aqui"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </Field>
      <Field rotulo="Nova senha">
        <input
          className={campoClass}
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </Field>
      <Field rotulo="Confirmar senha">
        <input
          className={campoClass}
          type="password"
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
        />
      </Field>

      <button className={botaoLaranja} disabled={enviando}>
        {enviando ? "Redefinindo..." : "Redefinir senha"}
      </button>

      <p className="pt-1 text-center text-sm">
        <Link to="/login" className={linkVerde}>
          Voltar para login
        </Link>
      </p>
    </AuthLayout>
  );
}
