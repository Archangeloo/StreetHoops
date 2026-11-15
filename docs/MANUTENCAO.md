# Manutenção

## Tecnologias

Frontend: React, Vite e React Router. Backend: Node.js, Express e Prisma. Banco: PostgreSQL 16.

O frontend usa `/api` pelo proxy do Vite. A API local usa a porta 3001. Controllers tratam HTTP; services aplicam as regras; middlewares verificam autenticação, origem e erros.

## Comandos

Execute na raiz do projeto. No Linux/macOS, substitua `npm.cmd` por `npm`.

| Comando | Uso |
| --- | --- |
| `npm.cmd ci` | Instalar as dependências conforme o lockfile. |
| `npm.cmd run local` | Preparar o ambiente com Docker e iniciar os servidores. |
| `npm.cmd run local:prepare` | Preparar o ambiente sem iniciar os servidores. |
| `npm.cmd run dev` | Iniciar somente API e frontend, com ambiente já preparado. |
| `npm.cmd run setup` | Criar configurações locais e segredos ausentes. |
| `npm.cmd run db:up` | Iniciar o PostgreSQL. |
| `npm.cmd run db:down` | Parar os contêineres preservando o volume do banco. |
| `npm.cmd run db:generate` | Gerar o cliente Prisma; pare a API antes no Windows. |
| `npm.cmd run db:deploy` | Aplicar migrações pendentes. |
| `npm.cmd run db:seed` | Adicionar dados fictícios com senha local configurada. |
| `npm.cmd run db:studio` | Inspecionar o banco no Prisma Studio. |
| `npm.cmd test` | Executar testes sem exigir banco. |
| `npm.cmd run test:integration` | Executar os testes HTTP com PostgreSQL local. |
| `npm.cmd run build` | Compilar o frontend em `frontend/dist`. |
| `npm.cmd run package` | Gerar `artifacts/Street-Hoops.zip` no Windows. |

## Configuração

O `setup` usa `.env.example`, `backend/.env.example` e `frontend/.env.example` como modelos e preserva configurações válidas existentes. Não troca a senha de um PostgreSQL já criado.

Na raiz, `.env` configura o contêiner. Em `backend/.env`, `DATABASE_URL` deve usar as mesmas credenciais. `AUTH_SECRET` e `RESET_SECRET` devem ser diferentes e ter pelo menos 32 caracteres. Não compartilhe os arquivos `.env` reais.

Sem Docker, configure seu próprio PostgreSQL, execute `setup`, ajuste `DATABASE_URL`, gere o Prisma, aplique as migrações e execute `dev`. Nesse caso, não use o iniciador `local`, que utiliza Docker.

## Testes e dados

`npm test` ignora explicitamente os testes que exigem banco. `test:integration` lê a conexão de `backend/.env`, aceita somente PostgreSQL local e cria um schema temporário próprio; ao terminar, remove somente esse schema. É necessário que o usuário do banco tenha permissão para criar schemas. É possível escolher outra conexão com `TEST_DATABASE_URL`.

As migrações estão em `backend/prisma/migrations`. Use `db:deploy` para atualizar um banco existente. Não use `prisma migrate reset` nem remova o volume Docker para atualizar o projeto.

## Partidas

Cada conta pode ocupar uma única partida ativa. A busca automática usa quadra, modalidade, pontuação, estilo e combinado iguais, priorizando a busca mais antiga. Abrir uma busca disponível pela interface solicita a entrada do jogador com check-in ativo. O servidor confirma a vaga em transação.

Ao completar as vagas, os jogadores são distribuídos entre as equipes por Elo e a partida passa para `EM_ANDAMENTO`. O placar leva a `AGUARDANDO_CONFIRMACAO`; a confirmação adversária encerra em `CONCLUIDA` e aplica XP/Elo uma única vez. Buscas podem ser canceladas antes de começar. O estado legado `PRONTA` é iniciado automaticamente quando uma partida completa é consultada e todos mantêm check-in válido.

## Publicação

O iniciador é para desenvolvimento local. Para publicar, configure HTTPS, origem e domínio, proxy `/api`, fallback SPA, PostgreSQL persistente e SMTP. A API exige SMTP em produção. Configure as variáveis descritas em `backend/.env.example`.

As fotos ficam em `backend/uploads`; preserve essa pasta com armazenamento persistente e backup. O banco e uploads não acompanham o ZIP de código. Cookies usam HttpOnly, SameSite e Secure em produção. Em múltiplas instâncias, os limites de requisição em memória precisam de armazenamento compartilhado.

## Gerar o download

`npm.cmd run package` inclui código, migrações, testes, documentação, iniciador e modelos de configuração. Exclui dependências, builds, uploads, configurações reais, arquivos temporários e metadados locais. O ZIP contém uma pasta `street-hoops/`; extraia tudo antes de iniciar.
