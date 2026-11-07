import { Sprout } from "lucide-react";
import { Link } from "react-router-dom";

/** Marca AgroStock: selo verde com o broto (mesmo estilo do selo do AgroBy). */
export default function Logo({ tamanho = "md", para = "/" }: { tamanho?: "md" | "lg"; para?: string }) {
  const grande = tamanho === "lg";
  return (
    <Link to={para} className="inline-flex items-center gap-2.5" aria-label="AgroStock — página inicial">
      <span
        className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-md shadow-primary/30 ${
          grande ? "h-11 w-11" : "h-9 w-9"
        }`}
      >
        <Sprout className={grande ? "h-6 w-6" : "h-5 w-5"} />
      </span>
      <span className={`font-extrabold ${grande ? "text-2xl" : "text-xl"}`}>AgroStock</span>
    </Link>
  );
}
