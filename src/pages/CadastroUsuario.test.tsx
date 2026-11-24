import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import CadastroUsuario from "./CadastroUsuario";
import { corpos, fetchFalso } from "../test/fetchFalso";
import { renderizar } from "../test/renderizar";

// O rótulo do campo inclui a dica abaixo dele, então localizamos pelo placeholder.
const campos: Record<string, string> = {
  login: "Ex.: maria.silva",
  email: "Digite seu e-mail",
  senha: "Mínimo 8 caracteres",
  confirmacao: "Repita a senha",
};

async function preencher(user: ReturnType<typeof renderizar>["user"], v: Record<string, string>) {
  for (const [k, txt] of Object.entries(v)) if (txt) await user.type(screen.getByPlaceholderText(campos[k]), txt);
  await user.click(screen.getByRole("button", { name: "Criar conta" }));
}

describe("Cadastro de usuário", () => {
  it("F11 bloqueia envio com campos inválidos e mostra as mensagens", async () => {
    const f = fetchFalso({});
    const { user } = renderizar(<CadastroUsuario />);
    await preencher(user, { login: "maria silva", email: "maria@", senha: "curta", confirmacao: "outra" });
    expect(screen.getByText("O usuário não pode conter espaços.")).toBeInTheDocument();
    expect(screen.getByText("E-mail inválido.")).toBeInTheDocument();
    expect(screen.getByText("A senha deve ter pelo menos 8 caracteres.")).toBeInTheDocument();
    expect(screen.getByText("As senhas não conferem.")).toBeInTheDocument();
    expect(corpos(f, "POST /usuarios")).toHaveLength(0);
  });

  it("F12 rejeita login com @ e senha acima de 72 bytes", async () => {
    fetchFalso({});
    const { user } = renderizar(<CadastroUsuario />);
    const longa = "ç".repeat(37); // 74 bytes em UTF-8
    await preencher(user, { login: "a@b", email: "a@b.com", senha: longa, confirmacao: longa });
    expect(screen.getByText('O usuário não pode conter "@".')).toBeInTheDocument();
    expect(screen.getByText("A senha deve ter no máximo 72 caracteres.")).toBeInTheDocument();
  });

  it("F13 cadastro válido envia dados aparados e leva ao login com aviso", async () => {
    const f = fetchFalso({ "POST /usuarios": { status: 201, corpo: { id: 9, login: "maria" } } });
    const { user } = renderizar(<CadastroUsuario />);
    await preencher(user, {
      login: "  maria ",
      email: "maria@fazenda.com",
      senha: "Senha1234",
      confirmacao: "Senha1234",
    });
    expect(await screen.findByTestId("destino")).toHaveTextContent("/login | Conta criada! Entre com sua senha.");
    expect(corpos(f, "POST /usuarios")[0]).toEqual({ login: "maria", email: "maria@fazenda.com", senha: "Senha1234" });
  });

  it("F14 exibe o erro 409 da API (login já existente)", async () => {
    fetchFalso({ "POST /usuarios": { status: 409, corpo: { erro: "já existe um usuário com este login" } } });
    const { user } = renderizar(<CadastroUsuario />);
    await preencher(user, { login: "maria", email: "maria@fazenda.com", senha: "Senha1234", confirmacao: "Senha1234" });
    expect(await screen.findByText("já existe um usuário com este login")).toBeInTheDocument();
  });
});
