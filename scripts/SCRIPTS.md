# Scripts

Inventario de scripts do repositorio.

## Regra

Cada dominio deve ter seus scripts dentro de subpastas em `scripts/` e seu uso deve ser documentado aqui.

## Situacao Atual

- scripts utilitarios versionados para operacao do Supabase oficial
- `scripts/supabase/start.ps1` para subir o stack local oficial
- `scripts/supabase/stop.ps1` para derrubar o stack local oficial
- o `scripts/supabase/*` usa somente o `.env` da raiz

## Futuro

- `scripts/brand/` para rotinas de assets e identidade
- `scripts/db/` para validacao de schema e seeds
- `scripts/qa/` para executores de testes e checks
