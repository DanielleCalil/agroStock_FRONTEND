import { Link } from "react-router-dom";
import { ArrowRight, BellRing, Layers, ShieldCheck, Warehouse } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../lib/auth";

const recursos = [
  {
    icone: Layers,
    titulo: "Controle por lote",
    texto: "Cada remessa com código, validade e saldo próprio. Entradas e saídas registradas lote a lote.",
  },
  {
    icone: BellRing,
    titulo: "Alertas de validade",
    texto: "Lotes vencendo em até 7 ou 30 dias aparecem em destaque no painel, antes de virar prejuízo.",
  },
  {
    icone: ShieldCheck,
    titulo: "Segurança",
    texto: "Senhas com hash bcrypt, sessões protegidas e cada movimentação registrada com autor e horário.",
  },
];

const botaoLaranja =
  "inline-flex items-center justify-center gap-3 rounded-lg bg-laranja px-7 py-3 text-sm font-semibold text-white shadow-[0_0_15px_5px_rgba(194,174,174,0.3)] transition hover:bg-laranja-escuro";
const botaoVerde =
  "inline-flex items-center justify-center gap-3 rounded-lg border border-primary bg-white px-7 py-3 text-sm font-semibold text-primary transition hover:shadow-[0_0_15px_5px_rgba(5,150,105,0.25)]";

export default function Home() {
  const { usuario } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Cabeçalho fixo */}
      <header className="fixed inset-x-0 top-0 z-20 border-b bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Logo />
          <nav className="flex items-center gap-2">
            {usuario ? (
              <Link to="/painel" className={`${botaoLaranja} px-5 py-2.5`}>
                Ir para o painel <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-4 py-2.5 text-sm font-semibold transition hover:shadow-[0_0_15px_5px_rgba(194,174,174,0.3)]">
                  Entrar
                </Link>
                <Link to="/cadastro" className={`${botaoLaranja} px-5 py-2.5`}>
                  Cadastre-se
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-28 md:px-8 md:pt-36">
        {/* Destaque */}
        <section className="flex flex-col items-center gap-12 md:flex-row md:justify-between">
          <div className="flex max-w-xl flex-col items-center gap-7 text-center md:items-start md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-primary bg-primary/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary">
              <Warehouse className="h-4 w-4" /> GESTÃO DE INSUMOS PARA O CAMPO
            </span>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl md:leading-[1.1]">
              Seu estoque de insumos, <span className="text-primary">sempre sob controle.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              O AgroStock é o controle de estoque da família AgroBy: sementes, fertilizantes e defensivos
              organizados por lote, com alertas de validade e o histórico de cada entrada e saída.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to={usuario ? "/painel" : "/cadastro"} className={botaoLaranja}>
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
              {!usuario && (
                <Link to="/login" className={botaoVerde}>
                  Já sou cadastrado
                </Link>
              )}
            </div>
          </div>
          <img
            src="/imagem-home.png"
            alt=""
            className="w-full max-w-sm rounded-3xl bg-white object-cover shadow-[0_0_15px_5px_rgba(134,231,135,0.3)] md:max-w-md"
          />
        </section>

        {/* Separador em degradê */}
        <div
          aria-hidden
          className="mb-12 mt-20 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,150,105,0) 0%, rgba(5,150,105,0.45) 25%, rgba(5,150,105,0.9) 50%, rgba(5,150,105,0.45) 75%, rgba(5,150,105,0) 100%)",
          }}
        />

        {/* Recursos */}
        <section className="grid gap-5 md:grid-cols-3">
          {recursos.map(({ icone: Icone, titulo, texto }) => (
            <article key={titulo} className="rounded-xl border p-5 transition hover:border-primary/60 hover:shadow-sm">
              <span className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                <Icone className="h-7 w-7" />
              </span>
              <h2 className="mt-3 text-lg font-bold">{titulo}</h2>
              <p className="mt-1 text-[15px] text-muted-foreground">{texto}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t px-6 py-7 text-center text-sm font-light text-muted-foreground">
        © 2026 AgroStock — Controle de insumos da família AgroBy.
      </footer>
    </div>
  );
}
