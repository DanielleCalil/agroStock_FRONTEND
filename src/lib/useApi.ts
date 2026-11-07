import { useCallback, useEffect, useState } from "react";
import { mensagemErro } from "./api";

/** Carrega dados da API ao montar (e quando `deps` mudam). */
export function useApi<T>(carregar: () => Promise<T>, deps: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    carregar()
      .then((d) => {
        if (!ativo) return;
        setDados(d);
        setErro(null);
      })
      .catch((e) => ativo && setErro(mensagemErro(e)))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);
  return { dados, erro, carregando, recarregar };
}
