# Street Hoops

<p align="center">
  <img src="frontend/public/brand/street-hoops-logo-v3.png" alt="Street Hoops — monograma SH em branco e laranja com linhas de uma bola de basquete" width="320" />
</p>

Aplicação web para encontrar jogadores e organizar partidas de basquete na mesma quadra.

## Comece aqui — Windows

1. Instale **Node.js 20.19 ou superior**, com npm, e **Docker Desktop**.
2. Abra o Docker Desktop e aguarde o mecanismo ficar pronto.
3. Extraia **todo o ZIP** em uma pasta, por exemplo `C:\Projetos\street-hoops`. Não execute de dentro do ZIP.
4. Abra **INICIAR.cmd** com dois cliques.
5. Aguarde a instalação e a mensagem `VITE ready`. A primeira execução precisa de internet e pode levar alguns minutos.
6. Abra **http://localhost:5173** no navegador.

O iniciador instala as dependências quando ausentes, prepara as configurações, inicia o PostgreSQL, aplica as migrações e abre os dois servidores. Mantenha a janela aberta enquanto usa o aplicativo. Para iniciar novamente, use o mesmo arquivo; não abra duas instâncias ao mesmo tempo.

Para parar, pressione **Ctrl+C** no terminal. Se aparecer a confirmação de encerramento, digite `S`. Os dados do banco permanecem salvos.

### Prefere o terminal?

Abra o PowerShell na pasta que contém este README:

```powershell
npm.cmd ci
npm.cmd run local
```

No Linux/macOS, use `npm` no lugar de `npm.cmd`, com Docker e Docker Compose disponíveis.

## Primeiro uso

O banco novo começa vazio. Você pode usar suas próprias contas e quadras ou carregar dados fictícios para demonstração.

**Com seus dados:** crie uma conta, cadastre uma quadra e aprove-a com uma conta moderadora. Para tornar sua conta moderadora, execute em outro terminal, na pasta do projeto:

```powershell
npm.cmd run moderator -- EMAIL_DA_SUA_CONTA
```

Entre novamente e abra a área de moderação em **Quadras** para aprová-la.

**Com dados de demonstração:** defina uma senha com pelo menos oito caracteres, letras e números em `SEED_DEMO_PASSWORD` no arquivo `backend/.env`. Depois execute:

```powershell
npm.cmd run db:seed
```

Isso adiciona quadras fictícias e as contas `alex@streethoops.example.test`, `bruna@streethoops.example.test` e `caio@streethoops.example.test`, usando a senha escolhida. O seed preserva as senhas de contas já existentes.

### Testar uma partida

1. Entre com duas contas diferentes, em navegadores ou perfis de navegador separados.
2. Faça check-in na mesma quadra com as duas contas.
3. Procure uma partida com a mesma modalidade, pontuação, estilo e combinado em ambas.
4. Os jogadores entram na mesma busca. A partida começa automaticamente com **2 jogadores no 1v1, 6 no 3v3 ou 10 no 5v5**.
5. Registre o placar. Um jogador da equipe adversária deve confirmar ou contestar o resultado.

Se você já estiver em uma partida ativa, a tela de criação abrirá essa partida. Cancele uma busca ou conclua a partida antes de procurar outra. Informar várias pessoas no check-in não cria contas nem confirma jogadores na partida.

## Se algo não iniciar

| Situação | O que fazer |
| --- | --- |
| Docker indisponível | Abra o Docker Desktop, aguarde ficar pronto e tente novamente. |
| Erro de conexão com `localhost:5432` | Verifique o Docker e execute `npm.cmd run db:up`. |
| Porta 5173 ou 3001 ocupada | Feche a outra instância do projeto antes de iniciar novamente. |
| Erro `EPERM` ao gerar o Prisma | Pare os servidores com Ctrl+C e abra `INICIAR.cmd` novamente. |
| Erro de senha do banco | A senha em `.env` deve corresponder à URL em `backend/.env` e à senha usada quando esse banco foi criado. Não apague o volume para tentar corrigir. |
| CPF ou e-mail já cadastrado | Entre na conta existente ou recupere a senha. |
| Recuperação não envia e-mail | Sem SMTP local, o link aparece no terminal identificado como `[API]`. |
| PowerShell bloqueia `npm.ps1` | Use `npm.cmd`, como nos exemplos acima. |

Diagnóstico da API: **http://localhost:3001/api/health**.

## Organização do download

| Arquivo ou pasta | Para que serve |
| --- | --- |
| `INICIAR.cmd` | Iniciar no Windows. |
| `README.md` | Instalação e primeiros passos. |
| `frontend/` | Interface React. |
| `backend/` | API, banco, migrações e testes. |
| `scripts/` | Configuração, inicialização e empacotamento. |
| `docs/` | Referência de manutenção. |
| `compose.yaml` | PostgreSQL local via Docker. |
| `.env.example` | Modelo de configuração, sem credenciais reais. |
| `package.json` e `package-lock.json` | Comandos e versões das dependências. |

O ZIP contém o código e os modelos de configuração. Dependências, builds, fotos, banco de dados e senhas locais são gerados ou configurados em cada computador.

Para testes, comandos manuais e publicação, consulte [docs/MANUTENCAO.md](docs/MANUTENCAO.md).
