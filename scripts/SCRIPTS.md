# Scripts

Inventário de scripts do repositório.

## Regra

Cada domínio deve ter seus scripts dentro de subpastas em `scripts/` e seu uso deve ser documentado aqui.

## Situação Atual

- scripts utilitários versionados para operação do Supabase oficial
- `scripts/supabase/start.ps1` para subir o stack local oficial
- `scripts/supabase/stop.ps1` para derrubar o stack local oficial
- `scripts/supabase/reset.ps1` para remover containers, volumes e dados do banco local
- `scripts/admin/ensure-superadmin.mjs` para criar ou atualizar o superadmin local definido no `.env`
- o `scripts/supabase/*` usa somente o `.env` da raiz
- o projeto Docker Compose local usa o nome técnico `luanamodotte-supabase`

## Futuro

- `scripts/brand/` para rotinas de assets e identidade
- `scripts/db/` para validação de schema e seeds
- `scripts/qa/` para executores de testes e checks
