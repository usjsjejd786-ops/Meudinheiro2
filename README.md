# MeuDinheiro

MeuDinheiro é uma plataforma web de controle financeiro pessoal. Ela permite
que cada usuário crie uma conta, registre entradas e gastos por categoria,
acompanhe seu saldo em tempo real e visualize sua situação financeira em
gráficos e um painel (dashboard).

O projeto é dividido em três partes independentes:

- **Frontend** — HTML5, CSS3 e JavaScript puro (sem frameworks).
- **Backend** — Node.js com Express, expondo uma API REST.
- **Banco de dados** — SQLite, com as tabelas `users` e `transactions`.

## 1. Tecnologias utilizadas

| Camada    | Tecnologias                                                   |
|-----------|----------------------------------------------------------------|
| Frontend  | HTML5, CSS3, JavaScript (Vanilla), Canvas API (gráficos)        |
| Backend   | Node.js, Express.js, JWT (jsonwebtoken), bcrypt, dotenv, cors   |
| Banco     | SQLite (via `better-sqlite3`)                                  |

## 2. Estrutura de pastas

```
meudinheiro/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── cadastro.html
│   ├── dashboard.html
│   ├── transacoes.html
│   ├── perfil.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js          (configuração da API e utilitários)
│       ├── login.js
│       ├── cadastro.js
│       ├── dashboard.js
│       ├── transacoes.js
│       └── perfil.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── database/
│   │   ├── database.js
│   │   └── schema.sql
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── transactions.js
│   │   └── dashboard.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── usersController.js
│   │   ├── transactionsController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── services/
│       ├── userService.js
│       └── transactionService.js
│
└── README.md
```

## 3. Como instalar o Node.js e as dependências

1. Instale o [Node.js](https://nodejs.org) (versão 18 ou superior é recomendada).
   Verifique a instalação com:
   ```bash
   node -v
   npm -v
   ```
2. Entre na pasta do backend e instale as dependências do projeto:
   ```bash
   cd meudinheiro/backend
   npm install
   ```
   Esse comando instalará `express`, `better-sqlite3`, `bcrypt`,
   `jsonwebtoken`, `dotenv` e `cors`.

## 4. Como criar/configurar o banco de dados

O banco de dados SQLite é criado **automaticamente** na primeira vez que o
servidor é iniciado: o arquivo `database/database.js` lê `database/schema.sql`
e cria as tabelas `users` e `transactions` caso ainda não existam. Não é
necessário nenhum passo manual de instalação de banco — apenas certifique-se
de que a pasta `backend/database/` tem permissão de escrita.

Se quiser recomeçar do zero, basta apagar o arquivo `.db` gerado dentro de
`backend/database/` (o nome exato é definido pela variável `DB_PATH`) e
reiniciar o servidor.

## 5. Como configurar o `.env`

1. Dentro da pasta `backend/`, copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
2. Abra o arquivo `.env` e ajuste os valores conforme necessário:

   | Variável          | Descrição                                                        |
   |-------------------|--------------------------------------------------------------------|
   | `PORT`            | Porta em que a API vai rodar (padrão: `3000`)                     |
   | `JWT_SECRET`      | Segredo usado para assinar os tokens de autenticação. **Troque por um valor único e aleatório.** |
   | `JWT_EXPIRES_IN`  | Validade do token de login (padrão: `7d`)                          |
   | `DB_PATH`         | Caminho do arquivo do banco SQLite (padrão: `./database/meudinheiro.db`) |
   | `FRONTEND_ORIGIN` | Origem permitida pelo CORS (endereço de onde o frontend é servido) |

## 6. Como iniciar o backend

Dentro da pasta `backend/`:

```bash
npm start
```

Você verá a mensagem:

```
MeuDinheiro API rodando em http://localhost:3000
```

Para checar se a API está no ar, acesse `http://localhost:3000/api/health`
no navegador.

## 7. Como acessar o frontend

O frontend é composto apenas por arquivos estáticos (HTML, CSS e JS), então
pode ser aberto de qualquer uma destas formas:

- **Abrindo diretamente no navegador**: dê duplo clique em
  `frontend/index.html` (ou clique com o botão direito e escolha "Abrir com
  o navegador").
- **Usando um servidor local simples** (recomendado, evita restrições de
  segurança do navegador ao abrir arquivos locais), por exemplo com a
  extensão "Live Server" do VS Code, ou com o pacote `http-server`:
  ```bash
  cd meudinheiro/frontend
  npx http-server -p 5500
  ```
  Depois acesse `http://127.0.0.1:5500` no navegador.

> Importante: o backend precisa estar rodando (passo 6) para que o
> login, cadastro e as demais funcionalidades funcionem, já que o frontend
> consome a API em `http://localhost:3000/api`. Se você mudar a porta do
> backend, atualize também a constante `API_BASE_URL` em
> `frontend/js/api.js`.
> Se o frontend for servido em um endereço diferente de
> `http://127.0.0.1:5500`, atualize também `FRONTEND_ORIGIN` no `.env` do
> backend para evitar bloqueio por CORS.

## 8. Fluxo de uso

1. Acesse `index.html` e clique em **Criar conta**.
2. Preencha nome, e-mail e senha em `cadastro.html`. Ao concluir, você é
   autenticado automaticamente e levado ao painel.
3. No **Painel** (`dashboard.html`), veja saldo, entradas, gastos, gastos do
   mês, as últimas transações e os gráficos de gastos por categoria e de
   entradas x gastos por mês. Use o botão **+ Nova transação** para lançar
   uma entrada ou gasto.
4. Em **Transações** (`transacoes.html`), veja todas as transações, filtre
   por tipo, categoria e período, e edite ou exclua lançamentos existentes.
5. Em **Perfil** (`perfil.html`), altere seu nome, troque sua senha ou saia
   da conta.

Um usuário recém-cadastrado sempre começa sem nenhuma transação: todos os
valores exibidos vêm exclusivamente do banco de dados, nunca de dados fixos
no HTML.

## 9. Usuário administrador

Este projeto **não implementa** um usuário administrador ou painel
administrativo — cada conta criada tem acesso apenas aos seus próprios
dados. Todas as rotas de transações e de perfil exigem um token JWT válido,
e o backend sempre filtra os dados pelo `user_id` do token, impedindo que um
usuário veja, edite ou exclua transações de outra pessoa.

## 10. Segurança implementada

- Senhas armazenadas com hash (`bcrypt`), nunca em texto puro.
- Autenticação via JSON Web Token (JWT), enviado no cabeçalho
  `Authorization: Bearer <token>`.
- Middleware de autenticação (`middleware/auth.js`) protegendo todas as
  rotas privadas (`/api/users/*`, `/api/transactions/*`, `/api/dashboard/*`).
- Toda consulta, atualização e exclusão de transação é filtrada pelo
  `user_id` do token — um usuário nunca acessa dados de outro.
- Validação de dados de entrada no backend (tipo, valor, categoria, datas,
  formato de e-mail, tamanho mínimo de senha etc.).
- Variáveis sensíveis (segredo do JWT, caminho do banco) mantidas fora do
  código-fonte, em um arquivo `.env` não versionado.
