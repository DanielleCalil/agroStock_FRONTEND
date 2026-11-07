/** Faixa de mensagem: verde para sucesso, vermelha para erro. */
export default function Aviso({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`rounded-xl p-3 text-center font-semibold ${
        ok ? "bg-primary/10 text-primary" : "bg-critical-soft text-critical-foreground"
      }`}
    >
      {children}
    </p>
  );
}
