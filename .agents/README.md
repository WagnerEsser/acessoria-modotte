# .agents

Camada operacional canonica deste repositorio.

## Objetivo

Organizar trabalho de IA por dominio, com instrucoes pequenas, claras e reutilizaveis.

## Estrutura

```text
.agents/
  README.md
  agents/
  workflows/
```

## Agentes Disponiveis

- `orchestrator`: coordena tarefas e evita conflito de escopo.
- `project-planner`: transforma briefing em especificacao e backlog.
- `frontend-specialist`: implementa interface, layout e sistema visual.
- `backend-specialist`: implementa rotas, validacao, auth e integracoes.
- `database-architect`: define schema, migracoes e indices.
- `qa-automation-engineer`: cria e executa testes.
- `seo-specialist`: cuida de metadata, sitemap e SEO local.
- `security-auditor`: revisa acesso, uploads e superficie publica.

## Regra De Uso

Escolha o menor numero de agentes que cubra o problema.
Se houver conflito de arquivos ou de decisao, o orquestrador deve assumir.
