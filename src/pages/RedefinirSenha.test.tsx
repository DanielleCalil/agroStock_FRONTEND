import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import RedefinirSenha from "./RedefinirSenha";
import EsqueciSenha from "./EsqueciSenha";
import { corpos, fetchFalso } from "../test/fetchFalso";
import { renderizar } from "../test/renderizar";

const rota = { url: "/redefinir-senha?token=abc123", caminho: "/redefinir-senha" };

describe("Recuperação de senha", () => {
  it("F18 'Esqueci a senha' valida o e-mail e exibe o token de desenvolvimento", async () => {
    const f = fetchFalso({
      "POST /senha/esqueci": {
        status: 200,
        corpo: {
          mensagem: "Se o e-mail estiver cadastrado, você receberá instruções.",
          tokenRedefinicao: "tok-xyz",
          expiraEmMinutos: 30,
        },
      },
    });
    const { user } = renderizar(<EsqueciSenha />);
    const campo = screen.getByRole("textbox");
    await user.type(campo, "invalido");
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Informe um e-mail válido.")).toBeInTheDocument();
    expect(corpos(f, "POST /senha/esqueci")).toHaveLength(0);

    await user.clear(campo);
    await user.type(campo, "maria@fazenda.com");
    await user.click(screen.getByRole("button"));
    expect(await screen.findByText(/Se o e-mail estiver cadastrado/)).toBeInTheDocument();
    expect(screen.getByText(/tok-xyz/)).toBeInTheDocument();
  });

  it("F19 lê o token da URL e valida a nova senha antes de enviar", async () => {
    const f = fetchFalso({});
    const { user } = renderizar(<RedefinirSenha />, rota);
    expect(screen.getByLabelText("Token")).toHaveValue("abc123");
    await user.type(screen.getByLabelText("Nova senha"), "Senha1234");
    await user.type(screen.getByLabelText("Confirmar senha"), "Senha9999");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));
    expect(screen.getByText("As senhas não conferem.")).toBeInTheDocument();
    expect(corpos(f, "POST /senha/redefinir")).toHaveLength(0);
  });

  it("F20 redefinição válida leva ao login com aviso de sucesso", async () => {
    const f = fetchFalso({
      "POST /senha/redefinir": { status: 200, corpo: { mensagem: "Senha redefinida com sucesso." } },
    });
    const { user } = renderizar(<RedefinirSenha />, rota);
    await user.type(screen.getByLabelText("Nova senha"), "NovaSenha456");
    await user.type(screen.getByLabelText("Confirmar senha"), "NovaSenha456");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));
    expect(await screen.findByTestId("destino")).toHaveTextContent("/login | Senha redefinida com sucesso");
    expect(corpos(f, "POST /senha/redefinir")[0]).toEqual({ token: "abc123", novaSenha: "NovaSenha456" });
  });

  it("F21 token inválido/expirado mostra o erro da API", async () => {
    fetchFalso({ "POST /senha/redefinir": { status: 400, corpo: { erro: "token inválido ou expirado" } } });
    const { user } = renderizar(<RedefinirSenha />, rota);
    await user.type(screen.getByLabelText("Nova senha"), "NovaSenha456");
    await user.type(screen.getByLabelText("Confirmar senha"), "NovaSenha456");
    await user.click(screen.getByRole("button", { name: "Redefinir senha" }));
    expect(await screen.findByText("token inválido ou expirado")).toBeInTheDocument();
  });
});
