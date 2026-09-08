# Luana Modotte Web App

Site institucional e painel administrativo para uma assessoria imobiliária. O projeto usa Next.js, TypeScript, Tailwind CSS e Supabase para banco, autenticação e dados administrativos.

## Requisitos

- Node.js `>=20.18.0`
- npm `11.13.0` ou versão compatível
- Docker Desktop, apenas se for usar o Supabase local

## Como Rodar Localmente

1. Instale as dependências:

```powershell
npm install
```

2. Crie o arquivo de ambiente:

```powershell
Copy-Item .env.example .env
```

3. Preencha o `.env` com os valores do ambiente local ou do Supabase usado no projeto.

Para uma execução simples do frontend, as variáveis mais importantes são:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SITE_URL=http://localhost:3000
```

Para criar ou atualizar automaticamente o usuário principal do painel administrativo local, configure também:

```env
ADMIN_SUPERADMIN_EMAIL=
ADMIN_SUPERADMIN_PASSWORD=
ADMIN_SUPERADMIN_FULL_NAME=
```

As chaves secretas devem ficar somente no `.env` local ou no painel do provedor de deploy. Não versionar senhas, service keys ou tokens.

4. Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

5. Acesse:

- Site público: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`
- Login do admin: `http://localhost:3000/admin/login`

## Subida com Makefile

Para facilitar a execução do projeto, use:

```powershell
make frontend      # sobe somente o frontend
make backend       # sobe o backend local e garante o superadmin do .env
make up            # instala dependências, sobe backend e frontend
make ensure-superadmin  # reaplica o bootstrap do superadmin local
make stop-backend  # para o backend local
```

## Supabase Local

Se precisar rodar a pilha local do Supabase, preencha o `.env` com os valores exigidos em `.env.example` e execute:

```powershell
.\scripts\supabase\start.ps1
```

Para parar:

```powershell
.\scripts\supabase\stop.ps1
```

Para limpar completamente o ambiente local, incluindo containers, volumes e
dados do banco:

```powershell
make dev-reset
```

Esse comando remove somente os dados do Supabase local deste projeto. Depois,
execute `make up` para recriar o ambiente do zero.

O schema fica consolidado em `supabase/migrations/0001_initial.sql` e os seeds
em `supabase/seeds/`.

No Docker Desktop, o grupo do Compose aparece como `luanamodotte-supabase`.

## Superadmin Local

O painel administrativo do site usa Supabase Auth. Para ter um usuário principal pronto ao subir o ambiente local, defina no `.env`:

```env
ADMIN_SUPERADMIN_EMAIL=seu-email-local
ADMIN_SUPERADMIN_PASSWORD=sua-senha-local
ADMIN_SUPERADMIN_FULL_NAME=Seu Nome
```

A senha precisa ter entre 14 e 128 caracteres, com maiúscula, minúscula, número e um destes símbolos: `!@%&*_-`.

Ao executar `make backend` ou `make up`, o projeto:

1. sobe o Supabase local;
2. cria ou atualiza o usuário no Supabase Auth;
3. marca o perfil correspondente em `public.users` como `superadmin` e ativo.

Para reaplicar esse processo sem reiniciar o backend:

```powershell
make ensure-superadmin
```

Depois acesse `http://localhost:3000/admin/login` com o e-mail e a senha definidos no `.env`.

## Acessar Banco Pelo DBeaver

Depois de subir o backend local com `make backend` ou `.\scripts\supabase\start.ps1`, crie uma nova conexão PostgreSQL no DBeaver com:

```text
Host: localhost
Porta: 5432
Database: postgres
Usuário: postgres.local
Senha: valor de POSTGRES_PASSWORD no arquivo .env
```

Neste projeto, a porta local `5432` passa pelo pooler do Supabase. Por isso o usuário precisa incluir o tenant local no final: `postgres.local`. Se usar apenas `postgres`, o DBeaver pode exibir o erro `no tenant identifier provided`.

Você também pode testar pela porta `6543`, que é o pooler em modo transacional:

```text
Host: localhost
Porta: 6543
Database: postgres
Usuário: postgres.local
Senha: valor de POSTGRES_PASSWORD no arquivo .env
```

Se você alterar `POSTGRES_DB`, `POSTGRES_PORT`, `POOLER_PROXY_PORT_TRANSACTION`, `POOLER_TENANT_ID` ou `POSTGRES_PASSWORD` no `.env`, use os mesmos valores na conexão do DBeaver. O formato do usuário é `postgres.<POOLER_TENANT_ID>`.

## Scripts

```powershell
npm run dev          # inicia o ambiente de desenvolvimento
npm run build        # gera o build de produção
npm run start        # executa o build de produção
npm run lint         # valida padrões de código
npm run typecheck    # valida TypeScript
npm test             # executa testes unitários com Vitest
npm run test:e2e     # executa testes end-to-end com Playwright
npm run verify       # roda typecheck, lint e testes unitários
```

## Estrutura Principal

```text
src/app/          rotas públicas, rotas administrativas e APIs
src/components/   componentes reutilizáveis
src/features/     módulos por domínio
src/lib/          helpers, validações, Supabase e regras compartilhadas
src/server/       actions, repositórios e serviços de servidor
supabase/         migrações, seeds e stack local
tests/            testes unitários, integração, e2e e visuais
docs/             especificações, arquitetura e guias operacionais
```

## Deploy

O projeto está configurado para Netlify. O build usa:

```powershell
npm run verify && npm run build
```

As variáveis de ambiente de homologação estão descritas em `deploy/netlify/.env.hml.example` e o fluxo completo está em `docs/deploy-hml-netlify-supabase.md`.

## Documentação

Os documentos principais do projeto estão em:

- `docs/especificacao-mestre-site-assessoria-imobiliaria.md`
- `docs/arquitetura-banco-rotas.md`
- `docs/estrutura-inicial-do-projeto.md`
- `docs/backlog-por-sprints.md`
