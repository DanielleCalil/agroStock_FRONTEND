# agroStock_FRONTEND

Interface web do AgroStock, sistema de controle de estoque de insumos agrícolas por lote e validade.
Feita em React + TypeScript, com Vite e Tailwind CSS.

- Aplicação publicada: https://agro-stock-frontend.vercel.app
- API (back-end em Go): https://github.com/DanielleCalil/agroStock_API

## Telas

| Rota | Tela |
|---|---|
| `/` | Página inicial |
| `/login`, `/cadastro` | Login e cadastro de usuário |
| `/esqueci-senha`, `/redefinir-senha` | Recuperação de senha por token |
| `/painel` | Alertas de validade (7 e 30 dias), estoque mínimo e gráfico de movimentações |
| `/movimentacao` | Entradas e saídas por lote, com prévia do saldo |
| `/cadastros` | Insumos e lotes |
| `/historico` | Histórico de movimentações com filtros por tipo e período |

As rotas a partir de `/painel` exigem login.

## Como rodar

Requisitos: Node.js 20 ou superior e a [agroStock API](https://github.com/DanielleCalil/agroStock_API) rodando.

```sh
npm install
cp .env.example .env   # ajuste VITE_API_URL se a API não estiver em http://localhost:8080
npm run dev            # abre em http://localhost:5173
```

A API precisa autorizar a origem do front-end no CORS (por padrão, `http://localhost:5173`).
O login usa cookie de sessão, então as chamadas são feitas com `credentials: "include"`.

## Testes

```sh
npm test             # roda a suíte uma vez
npm run test:watch   # modo observação
```

São 26 casos (Vitest + Testing Library), numerados de F01 a F26, cobrindo:

- o cliente da API: cookie de sessão, conversão de erros, falha de rede e redirecionamento em 401;
- as validações de cadastro, login e recuperação de senha;
- a movimentação: bloqueio de saída maior que o saldo e a chave de idempotência, que evita lançamento duplicado em duplo clique ou reenvio.

Nesses testes a API é simulada (mock de `fetch`). Os testes contra a API real ficam no repositório da API (`evidencias/e2e.sh`).
A evidência da última execução está em [evidencias/2026-11-24_vitest.txt](evidencias/2026-11-24_vitest.txt).

## Build e deploy

```sh
npm run build   # checagem de tipos + build de produção em dist/
```

O deploy é feito na Vercel a partir da branch `main`. O arquivo `vercel.json` redireciona todas as rotas para o `index.html`, para que uma rota aberta direto (ex.: `/login`) não retorne 404.

## Licença

MIT. Veja [LICENSE](LICENSE).
