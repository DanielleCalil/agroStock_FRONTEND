import type { ReactNode } from "react";

/** Cartão padrão dos painéis: título, subtítulo opcional e conteúdo. */
export default function Card({
  titulo,
  subtitulo,
  acao,
  children,
  className = "",
}: {
  titulo?: string;
  subtitulo?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border bg-card p-5 shadow-sm ${className}`}>
      {(titulo || acao) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {titulo && <h2 className="font-bold">{titulo}</h2>}
            {subtitulo && <p className="text-sm text-muted-foreground">{subtitulo}</p>}
          </div>
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}
