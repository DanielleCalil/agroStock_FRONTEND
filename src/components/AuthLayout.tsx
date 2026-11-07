import type { FormEventHandler, ReactNode } from "react";
import Logo from "./Logo";

/**
 * Moldura das telas de acesso (login, cadastro, senha), no estilo do AgroBy:
 * foto de fundo clareada, logo acima e cartão branco translúcido.
 */
export default function AuthLayout({
  titulo,
  subtitulo,
  largo = false,
  onSubmit,
  children,
}: {
  titulo: string;
  subtitulo: string;
  largo?: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-screen flex-col items-center justify-center gap-7 px-4 py-10">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.55)), url('/background.jpg')",
        }}
      />
      <Logo tamanho="lg" />
      <form
        onSubmit={onSubmit}
        noValidate
        className={`w-full rounded-2xl border border-white/60 bg-white/90 p-6 shadow-[0_0_15px_5px_rgba(194,174,174,0.3)] backdrop-blur-sm sm:p-8 ${
          largo ? "max-w-3xl" : "max-w-md"
        }`}
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold">{titulo}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>
        </div>
        <div className="space-y-4">{children}</div>
      </form>
    </div>
  );
}

/** Botão laranja principal das telas de acesso. */
export const botaoLaranja =
  "w-full rounded-xl bg-laranja py-3 font-bold text-white shadow-[0_0_15px_5px_rgba(194,174,174,0.3)] transition hover:bg-laranja-escuro active:scale-[0.99] disabled:opacity-60";

/** Link verde discreto (Esqueci minha senha, Voltar para login...). */
export const linkVerde = "font-semibold text-primary hover:underline";

/** Mensagem de sucesso (verde) no topo do formulário. */
export function Toast({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-center text-sm text-emerald-800">
      {children}
    </p>
  );
}

/** Mensagem de erro (vermelha). */
export function Erro({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl border border-critical/30 bg-critical-soft px-3 py-2.5 text-center text-sm text-critical-foreground">
      {children}
    </p>
  );
}
