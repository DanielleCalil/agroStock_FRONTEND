import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { diasAte } from "../lib/format";

/** Cabeçalho padrão das telas internas. */
export function PageHeader({ titulo, subtitulo, acoes }: { titulo: string; subtitulo?: string; acoes?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">{titulo}</h1>
        {subtitulo && <p className="text-muted-foreground">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </header>
  );
}

/** Campo com rótulo e dica opcional. */
export function Field({ rotulo, dica, children }: { rotulo: string; dica?: ReactNode; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{rotulo}</span>
      {children}
      {dica && <span className="block text-xs text-muted-foreground">{dica}</span>}
    </label>
  );
}

export const campoClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";

/** Select nativo com seta customizada. */
export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={`${campoClass} appearance-none pr-10 ${className}`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

/** Controle segmentado (abas / filtros de opção única). */
export function Segmented<T extends string | number>({
  opcoes,
  valor,
  onChange,
  tamanho = "md",
}: {
  opcoes: { valor: T; rotulo: ReactNode }[];
  valor: T;
  onChange: (v: T) => void;
  tamanho?: "sm" | "md";
}) {
  return (
    <div className="inline-flex w-full rounded-xl bg-secondary p-1 sm:w-auto">
      {opcoes.map((o) => (
        <button
          key={String(o.valor)}
          type="button"
          onClick={() => onChange(o.valor)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg font-semibold transition sm:flex-none ${
            tamanho === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2"
          } ${valor === o.valor ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}

/** Selo com a situação da validade de um lote. */
export function ValidadeChip({ validade }: { validade: string }) {
  const dias = diasAte(validade);
  const [a, m, d] = validade.split("-");
  const data = `${d}/${m}/${a}`;
  let classe = "bg-primary/10 text-primary";
  let texto = data;
  if (dias < 0) {
    classe = "bg-critical-soft text-critical-foreground";
    texto = `Vencido · ${data}`;
  } else if (dias <= 7) {
    classe = "bg-critical-soft text-critical-foreground";
    texto = dias === 0 ? "Vence hoje" : `${dias} dia(s) · ${data}`;
  } else if (dias <= 30) {
    classe = "bg-attention-soft text-attention-foreground";
    texto = `${dias} dias · ${data}`;
  }
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${classe}`}>{texto}</span>;
}

/** Estado vazio com ícone. */
export function Vazio({ icone, titulo, texto }: { icone: ReactNode; titulo: string; texto?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="rounded-2xl bg-secondary p-3 text-muted-foreground">{icone}</span>
      <p className="font-bold">{titulo}</p>
      {texto && <p className="max-w-xs text-sm text-muted-foreground">{texto}</p>}
    </div>
  );
}

export function Esqueleto({ className = "h-40" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-secondary ${className}`} />;
}
