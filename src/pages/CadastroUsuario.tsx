import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout, { Erro, botaoLaranja, linkVerde } from "../components/AuthLayout";
import { Field, campoClass } from "../components/ui";
import { mensagemErro } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { EstadoLogin } from "./Login";

type Form = { login: string; email: string; senha: string; confirmacao: string };
type Erros = Partial<Record<keyof Form, string>>;

// Mesmas regras da API (POST /usuarios).
function validar(f: Form): Erros {
  const e: Erros = {};
  const login = f.login.trim();
  if (!login) e.login = "Informe o usuário.";
  else if (/\s/.test(login)) e.login = "O usuário não pode conter espaços.";
  else if (login.includes("@")) e.login = 'O usuário não pode conter "@".';
  if (!f.email.trim()) e.email = "Informe o e-mail.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "E-mail inválido.";
  if (f.senha.length < 8) e.senha = "A senha deve ter pelo menos 8 caracteres.";
  else if (new TextEncoder().encode(f.senha).length > 72) e.senha = "A senha deve ter no máximo 72 caracteres.";
  if (f.confirmacao !== f.senha) e.confirmacao = "As senhas não conferem.";
  return e;
}

function MsgCampo({ texto }: { texto?: string }) {
  return texto ? <span className="block text-xs font-semibold text-critical-foreground">{texto}</span> : null;
}

export default function CadastroUsuario() {
  const navigate = useNavigate();
  const { usuario, verificando, cadastrar } = useAuth();
  const [form, setForm] = useState<Form>({ login: "", email: "", senha: "", confirmacao: "" });
  const [erros, setErros] = useState<Erros>({});
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!verificando && usuario) return <Navigate to="/painel" replace />;

  const campo = (k: keyof Form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }),
    className: `${campoClass} ${erros[k] ? "border-critical" : ""}`,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const encontrados = validar(form);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    setErroApi(null);
    try {
      const login = form.login.trim();
      await cadastrar({ login, email: form.email.trim(), senha: form.senha });
      const estado: EstadoLogin = { login, aviso: "Conta criada! Entre com sua senha." };
      navigate("/login", { replace: true, state: estado });
    } catch (err) {
      setErroApi(mensagemErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout largo titulo="Cadastro" subtitulo="Faça o cadastro para criar sua conta no AgroStock." onSubmit={handleSubmit}>
      {erroApi && <Erro>{erroApi}</Erro>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field rotulo="Usuário" dica={!erros.login && "Usado para entrar. Sem espaços."}>
          <input {...campo("login")} placeholder="Ex.: maria.silva" autoComplete="username" maxLength={50} />
          <MsgCampo texto={erros.login} />
        </Field>
        <Field rotulo="E-mail" dica={!erros.email && "Para recuperar a senha."}>
          <input {...campo("email")} type="email" placeholder="Digite seu e-mail" autoComplete="email" maxLength={255} />
          <MsgCampo texto={erros.email} />
        </Field>
        <Field rotulo="Senha">
          <input {...campo("senha")} type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
          <MsgCampo texto={erros.senha} />
        </Field>
        <Field rotulo="Confirmar senha">
          <input {...campo("confirmacao")} type="password" placeholder="Repita a senha" autoComplete="new-password" />
          <MsgCampo texto={erros.confirmacao} />
        </Field>
      </div>

      <button className={botaoLaranja} disabled={enviando}>
        {enviando ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="pt-1 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/login" className={linkVerde}>
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
