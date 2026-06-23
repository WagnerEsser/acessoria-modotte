# Agent Readme

Este documento e o mapa rapido para agentes de IA que vao trabalhar neste repositorio.

## O Que Ler Primeiro

1. `AGENTS.md`
2. `docs/especificacao-mestre-site-assessoria-imobiliaria.md`
3. `docs/backlog-por-sprints.md`
4. `docs/arquitetura-banco-rotas.md`
5. `docs/estrutura-inicial-do-projeto.md`
6. `docs/ai/AGENT-CONFIG.md`
7. `docs/ai/AGENT-CONTEXT-PROTOCOL.md`

## O Que Este Projeto Precisa Entregar

- Site publico premium para a assessoria imobiliaria.
- Area administrativa para gerenciar conteudos, paginas, leads e imoveis.
- Banco com schema claro, migracoes e regras de acesso.
- Testes para proteger o fluxo principal.
- Estrutura que permita trabalho paralelo por multiagentes.

## Regra Operacional Principal

Se a tarefa for pequena, um agente pode executar sozinho.
Se a tarefa tocar mais de um dominio, o orquestrador deve quebrar em partes e atribuir papeis.

## Papeis Recomendados

- Orchestrator: coordena trabalho paralelo, resolve conflito de arquivos e monta contexto.
- Project Planner: transforma briefing em especificacao, backlog e sprint.
- Frontend Specialist: pagina, componentes, layout, responsividade e brand system.
- Backend Specialist: server actions, routes, autenticacao, validacao e integracoes.
- Database Architect: schema, migracoes, indices, constraints e policies.
- QA Automation Engineer: testes unitarios, integracao, e2e e visual.
- SEO Specialist: metadata, sitemap, robots, schema markup e estrategia local.
- Security Auditor: acesso, uploads, formularios, env e superficie exposta.

## Fluxo Sugerido Para Uma Tarefa Nova

1. Registrar objetivo e criterios de aceite.
2. Criar o pacote em `tmp/context/<modelo>/<slug>/`.
3. Definir quais agentes vao trabalhar.
4. Executar com escopo curto.
5. Validar com testes.
6. Registrar handoff.

## Quando Nao Avancar

- Se houver duvida de escopo, parar e escrever a decisao em vez de supor.
- Se houver conflito de arquivos, resolver antes de editar.
- Se faltar teste ou criterio de aceite, a entrega nao deve ser marcada como concluida.
