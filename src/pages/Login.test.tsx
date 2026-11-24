import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import Login from "./Login";
import { corpos, fetchFalso } from "../test/fetchFalso";
import { renderizar } from "../test/renderizar";

const rota = { url: "/login", caminho: "/login" };

describe("Login", () => {
  it("F15 exige usuário e senha antes de chamar a API", async () => {
    const f = fetchFalso({});
    const { user } = renderizar(<Login />, rota);
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByText("Informe o usuário (ou e-mail) e a senha.")).toBeInTheDocument();
    expect(corpos(f, "POST /sessao")).toHaveLength(0);
  });

  it("F16 senha errada mostra a mensagem da API e permanece na tela", async () => {
    fetchFalso({ "POST /sessao": { status: 401, corpo: { erro: "login ou senha inválidos" } } });
    const { user } = renderizar(<Login />, rota);
    await user.type(screen.getByLabelText("Usuário ou e-mail"), "maria");
    await user.type(screen.getByLabelText("Senha"), "errada123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("login ou senha inválidos")).toBeInTheDocument();
    expect(screen.queryByTestId("destino")).not.toBeInTheDocument();
  });

  it("F17 login válido redireciona ao painel", async () => {
    fetchFalso({ "POST /sessao": { status: 200, corpo: { id: 1, login: "maria" } } });
    const { user } = renderizar(<Login />, rota);
    await user.type(screen.getByLabelText("Usuário ou e-mail"), "maria");
    await user.type(screen.getByLabelText("Senha"), "Senha1234");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByTestId("destino")).toHaveTextContent("/painel");
  });
});
