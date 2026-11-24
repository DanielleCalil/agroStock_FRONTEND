import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "../lib/auth";

/** Mostra a rota atual e o aviso recebido, para conferir redirecionamentos. */
function Destino() {
  const loc = useLocation();
  const aviso = (loc.state as { aviso?: string } | null)?.aviso;
  return (
    <div data-testid="destino">
      {loc.pathname}
      {aviso ? ` | ${aviso}` : ""}
    </div>
  );
}

export function renderizar(el: JSX.Element, { url = "/", caminho = "/" } = {}) {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[url]}>
      <AuthProvider>
        <Routes>
          <Route path={caminho} element={el} />
          <Route path="*" element={<Destino />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
  return { user };
}
