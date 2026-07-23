# Homologacao com Netlify e Supabase Cloud

Este ambiente existe para demonstracao e validacao com a cliente. Ele usa:

- Netlify Free para executar a aplicacao Next.js;
- Supabase Cloud Free para banco de dados e autenticacao;
- branch `hml` como origem dos deploys automaticos;
- URL gratuita e estavel `https://<nome-do-site>.netlify.app`.

## Fluxo de deploy

1. Alteracoes sao enviadas para a branch `hml`.
2. O Netlify executa `npm run verify` e `npm run build`.
3. Somente um build aprovado substitui o deploy publicado.
4. O link `netlify.app` permanece o mesmo entre os deploys.

No Netlify, a branch de producao deste site deve ser configurada como `hml`.

## Variaveis do Netlify

Cadastre as variaveis em **Site configuration > Environment variables**. O
modelo sem segredos esta em `deploy/netlify/.env.hml.example`.

| Variavel | Visibilidade | Finalidade |
| --- | --- | --- |
| `SITE_URL` | servidor/build | URL publica completa do Netlify |
| `NEXT_PUBLIC_SUPABASE_URL` | publica | URL da API do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publica | chave publica do Supabase |
| `SUPABASE_SECRET_KEY` | secreta | administracao de usuarios pelo servidor |
| `AUTH_RATE_LIMIT_SECRET` | secreta | assinatura do limitador de tentativas de login |
| `LEAD_RATE_LIMIT_SECRET` | secreta | assinatura do limitador de formularios |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | publica | chave publica do Turnstile |
| `TURNSTILE_SECRET_KEY` | secreta | verificacao do Turnstile no servidor |

`SITE_URL` e a unica fonte para URLs canonicas, sitemap, robots, dados
estruturados e redirecionamentos da aplicacao. Ao trocar o dominio, altere
somente essa variavel e execute um novo deploy.

As chaves secretas nunca devem ser salvas no repositorio, em issues, logs ou
mensagens. Use valores diferentes para homologacao e producao.

## Preparacao do Supabase Cloud

Crie um projeto gratuito, preferencialmente na regiao mais proxima da cliente.
No SQL Editor, execute nesta ordem:

1. `supabase/migrations/0001_initial.sql`;
2. `supabase/migrations/0002_security_hardening.sql`;
3. `supabase/migrations/0003_admin_user_management.sql`;
4. `supabase/migrations/0004_explicit_data_api_grants.sql`;
5. `supabase/seeds/0001_initial_seed.sql`.

Em **Authentication > URL Configuration**:

- use o valor de `SITE_URL` como Site URL;
- inclua `${SITE_URL}/**` nas URLs de redirecionamento permitidas.

Em **Authentication > Providers > Email**:

- mantenha login por e-mail e senha habilitado;
- desabilite cadastro publico;
- nao habilite MFA;
- exija senhas fortes.

Crie o primeiro administrador diretamente em **Authentication > Users**. Os
demais administradores podem ser cadastrados pelo painel em `/admin/usuarios`.

## Cloudflare Turnstile

Cadastre o hostname `<nome-do-site>.netlify.app` em um widget gratuito do
Turnstile e grave as duas chaves somente nas variaveis do Netlify. Os
formularios publicos ficam bloqueados em ambiente publicado se essas chaves
nao estiverem configuradas.

## Validacao depois do deploy

Verifique:

- home, listagem e pagina de detalhe de imoveis;
- `robots.txt` e `sitemap.xml`;
- envio de formulario publico;
- login em `/admin/login`;
- criacao de um segundo usuario em `/admin/usuarios`;
- login com o segundo usuario;
- ausencia de chaves secretas no HTML e nos logs do deploy.
