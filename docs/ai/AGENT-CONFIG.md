# Agent Configuration

Este repositorio usa uma divisao clara entre documentacao duravel, camada operacional e contexto temporario.

## Camadas Do Projeto

- `docs/`: especificacao, backlog, arquitetura e guias duraveis.
- `.agents/`: camada operacional canonica para agentes.
- `.codex/`: configuracoes especificas do Codex e revisoes automatizadas.
- `tmp/context/`: contexto temporario por tarefa.
- `tmp/tarefas/`: fila de estado das entregas.
- `supabase/migrations/`: fonte de verdade do schema do banco.
- `scripts/`: utilitarios e rotinas repetiveis.

## Convencoes

- Nomes em kebab-case.
- Uma responsabilidade por arquivo.
- Nao misturar decisao de produto com implementacao.
- Nao gravar contexto de tarefa em canais informais quando o arquivo estruturado resolver.
- Nao usar arquivos temporarios como fonte de verdade.

## Layout Operacional Da Tarefa

Quando a tarefa for relevante, usar:

```text
tmp/context/<modelo>/<slug>/
  REQUEST.md
  SPEC.md
  PLAN.md
  AGENTS.md
  RESULTS.md
  HANDOFF.md
```

## Papeis Operacionais

- `orchestrator`: coordena, cria contexto e distribui trabalho.
- `project-planner`: escreve especificacao e backlog.
- `frontend-specialist`: implementa interface, layout e componentes.
- `backend-specialist`: implementa servicos, rotas e validacao.
- `database-architect`: define schema e migracoes.
- `qa-automation-engineer`: escreve e executa validacoes.
- `seo-specialist`: garante indexacao, metadados e local SEO.
- `security-auditor`: revisa acesso, dados sensiveis e superficie publica.

## Regra Para Este Produto

Este site e de uma unica assessoria imobiliaria. Nao ha multiconta nem multi-tenant no escopo inicial. Isso simplifica schema, permissao e revisao de risco.
