import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthLayout, { Erro, Toast, botaoLaranja, linkVerde } from "../components/AuthLayout";
import { Field, campoClass } from "../components/ui";
import { api, mensagemErro } from "../lib/api";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [token, setToken] = useState<{ valor: string; minutos?: number } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setEnviando(true);
    setErro(null);
    setSucesso(null);
    setToken(null);
    try {
      const resp = await api.esqueciSenha(email.trim());
      setSucesso(resp.mensagem);
      // Só vem em desenvolvimento (RESET_TOKEN_NA_RESPOSTA=true na API).
      if (resp.tokenRedefinicao) setToken({ valor: resp.tokenRedefinicao, minutos: resp.expiraEmMinutos });
    } catch (err) {
      setErro(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      titulo="Esqueci minha senha"
      subtitulo="Informe seu e-mail para receber as instruções de recuperação."
      onSubmit={handleSubmit}
    >
      {sucesso && <Toast>{sucesso}</Toast>}
      {erro && <Erro>{erro}</Erro>}

      <Field rotulo="E-mail">
        <input
          className={campoClass}
          type="email"
          placeholder="Digite seu e-mail"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <button className={botaoLaranja} disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar"}
      </button>

      {token && (
        <div className="space-y-2 rounded-xl border border-dashed border-laranja/60 bg-orange-50 p-3">
          <p className="text-xs text-orange-900">
            Ambiente de desenvolvimento: o envio de e-mail ainda não existe, então a API devolveu o token aqui
            {token.minutos ? ` (válido por ${token.minutos} minutos)` : ""}.
          </p>
          <code className="block break-all rounded-lg bg-white px-2 py-1.5 text-xs font-semibold">{token.valor}</code>
          <Link
            to={`/redefinir-senha?token=${encodeURIComponent(token.valor)}`}
            className="inline-flex items-center gap-1 text-sm font-bold text-laranja-escuro hover:underline"
          >
            Redefinir agora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 pt-1 text-sm">
        <Link to="/redefinir-senha" className={linkVerde}>
          Já possui token? Redefinir senha
        </Link>
        <Link to="/login" className={linkVerde}>
          Voltar para login
        </Link>
      </div>
    </AuthLayout>
  );
}
