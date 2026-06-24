# Execucao local com o Supabase oficial

O backend deste projeto foi organizado para usar o stack oficial self-hosted do Supabase em `supabase/docker`.
Toda a configuracao de ambiente vive no `.env` da raiz.

## O que sobe

1. `supabase/docker` para o stack oficial do Supabase.
2. `npm run dev` para o site e o painel Next.js.
3. `scripts/supabase/start.ps1` e `scripts/supabase/stop.ps1` como atalhos no Windows.

## Arquivos envolvidos

- [.env.example](../.env.example)
- [supabase/docker/docker-compose.yml](../supabase/docker/docker-compose.yml)
- [scripts/supabase/start.ps1](../scripts/supabase/start.ps1)
- [scripts/supabase/stop.ps1](../scripts/supabase/stop.ps1)
- [deploy/Dockerfile](../deploy/Dockerfile)

## Passo a passo

1. Copie `.env.example` para `.env` na raiz e ajuste as chaves antes de subir o Supabase.
2. Para subir o backend oficial, use:

```powershell
.\scripts\supabase\start.ps1
```

3. Em outro terminal, rode o app:

```powershell
npm run dev
```

4. Para derrubar o backend:

```powershell
.\scripts\supabase\stop.ps1
```

## Observacoes

- O compose da raiz foi removido para evitar uma estrutura hibrida.
- O `Dockerfile` de deploy ficou em `deploy/Dockerfile`.
- O stack oficial do Supabase publica o gateway HTTP na porta `8000` neste projeto.
- O helper do Windows le o `.env` da raiz e passa essas variaveis para o stack do Supabase.
- Quando `SUPABASE_URL` e `SUPABASE_ANON_KEY` estiverem definidos, o app usa o backend real.
