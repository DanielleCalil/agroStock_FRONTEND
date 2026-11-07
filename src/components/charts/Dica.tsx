import type { ReactNode } from "react";

/** Caixa de tooltip dos gráficos (texto nas cores de texto; a cor fica no marcador). */
export function Dica({ titulo, linhas }: { titulo: string; linhas: { cor?: string; rotulo: string; valor: ReactNode }[] }) {
  return (
    <div className="rounded-xl border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-bold">{titulo}</p>
      {linhas.map((l) => (
        <p key={l.rotulo} className="flex items-center gap-2 text-muted-foreground">
          {l.cor && <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.cor }} />}
          {l.rotulo}
          <span className="ml-auto pl-3 font-semibold text-foreground tabular-nums">{l.valor}</span>
        </p>
      ))}
    </div>
  );
}

/** Legenda: marcador colorido + texto neutro. */
export function Legenda({ itens }: { itens: { cor: string; rotulo: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
      {itens.map((i) => (
        <span key={i.rotulo} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.cor }} />
          {i.rotulo}
        </span>
      ))}
    </div>
  );
}
