# Estrutura Inicial do Projeto - Assessoria Imobiliaria

> Estrutura proposta para o repositorio antes da implementacao completa. Serve como mapa para agentes e humanos.

## Objetivo

Organizar o repositorio em camadas claras para facilitar trabalho paralelo, revisao, testes e manutencao.

## Estrutura Proposta

```text
AGENTS.md
.agents/
.codex/
assets/
  brand/

docs/
  backlog-por-sprints.md
  arquitetura-banco-rotas.md
  estrutura-inicial-do-projeto.md
  especificacao-mestre-site-assessoria-imobiliaria.md

tmp/
  context/
  prompts/
  tarefas/

public/
  brand/
  images/
  icons/

src/
  app/
    (site)/
    (admin)/
    api/
  components/
    ui/
    layout/
    shared/
  features/
    auth/
    content/
    leads/
    properties/
    seo/
    settings/
  lib/
    db/
    env/
    utils/
    validations/
  server/
    actions/
    repositories/
    services/
  styles/
  types/

supabase/
  migrations/
  seeds/

tests/
  unit/
  integration/
  e2e/
  visual/
```

## Funcao de Cada Pasta

### `assets/`

- materiais de marca
- referencias de identidade
- arquivos fonte que nao vao direto para producao

### `.agents/`

- instrucoes operacionais para agentes de IA
- workflows reutilizaveis
- definicao dos papeis especializados

### `.codex/`

- configuracoes especificas do Codex
- revisores e auditores focados em areas sensiveis

### `tmp/`

- contexto temporario por tarefa
- fila operacional das entregas
- prompts e artefatos descartaveis depois do handoff

### `docs/`

- especificacoes
- backlog
- arquitetura
- guias de execucao por agentes

### `public/`

- arquivos servidos diretamente
- imagens e icones finais de producao

### `src/app/`

- rotas da aplicacao
- paginas publicas
- paginas administrativas
- endpoints de API
- route groups nao entram na URL; no admin, o caminho real fica em `src/app/(admin)/admin/...`

### `src/components/`

- componentes reutilizaveis da interface
- blocos de layout
- componentes compartilhados por varias rotas

### `src/features/`

- modulos por dominio
- auth
- content
- leads
- properties
- seo
- settings

### `src/lib/`

- helpers puros
- conexao com banco
- utilitarios
- validacoes

### `src/server/`

- servicos de aplicacao
- actions de servidor
- repositores de dados
- regras de negocio

### `src/styles/`

- tokens globais
- estilos base
- ajustes de tema

### `src/types/`

- tipos centrais
- contratos de dados
- modelos compartilhados

### `supabase/`

- migracoes
- seeds
- scripts ligados ao banco

### `tests/`

- cobertura unitaria
- integracao
- E2E
- visual regression

## Regras de Estrutura

- Nao misturar regra de negocio com componente visual.
- Nao colocar acesso a banco dentro de componente de apresentacao.
- Nao criar arquivos soltos sem dono de dominio.
- Todo modulo novo deve entrar em `features/` ou `server/` com justificativa.
- Todo teste novo deve morar na pasta da sua categoria.

## Ordem de Implementacao

1. `docs/`
2. `supabase/`
3. `src/lib/`
4. `src/server/`
5. `src/features/`
6. `src/components/`
7. `src/app/`
8. `tests/`

## Critério de Pronto da Estrutura

- Pastas principais criadas.
- Responsabilidade de cada pasta documentada.
- Estrutura alinhada com os sprints e com a arquitetura do banco e rotas.
