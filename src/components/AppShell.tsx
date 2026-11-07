import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeftRight, History, LayoutDashboard, LogOut, SquarePlus, Sprout } from "lucide-react";
import { useAuth } from "../lib/auth";

const navItems = [
  { to: "/painel", label: "Painel", icon: LayoutDashboard },
  { to: "/movimentacao", label: "Movimentar", icon: ArrowLeftRight },
  { to: "/cadastros", label: "Cadastros", icon: SquarePlus },
  { to: "/historico", label: "Histórico", icon: History },
];

/** `largo`: área de conteúdo mais larga (painéis com gráficos). */
export default function AppShell({ children, largo = false }: { children: ReactNode; largo?: boolean }) {
  const { usuario, sair } = useAuth();
  const inicial = usuario?.login.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-background">
      {/* Menu lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card px-4 py-6 md:flex">
        <div className="mb-10 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-md shadow-primary/30">
            <Sprout className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <p className="text-xl font-extrabold">AgroStock</p>
            <p className="text-xs text-muted-foreground">Insumos agrícolas</p>
          </div>
        </div>

        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Menu</p>
        <nav className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition active:scale-[0.98] ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-2xl border bg-background p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
            {inicial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{usuario?.login}</p>
            <p className="text-xs text-muted-foreground">Conectado</p>
          </div>
          <button
            onClick={sair}
            aria-label="Sair"
            title="Sair"
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-critical-soft hover:text-critical-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <main className="pb-24 md:pb-8 md:pl-64">
        <div className={`mx-auto ${largo ? "max-w-6xl" : "max-w-3xl"}`}>{children}</div>
      </main>

      {/* Barra inferior (mobile) */}
      <nav className="fixed bottom-0 z-20 flex w-full justify-around border-t bg-card/90 p-2 backdrop-blur md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`
            }
          >
            <Icon className="h-6 w-6" /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
