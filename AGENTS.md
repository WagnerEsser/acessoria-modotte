# AGENTS.md

Ponto de entrada para agentes de IA neste repositorio.

## Ordem de leitura

1. `docs/ai/AGENT_README.md`
2. `docs/especificacao-mestre-site-assessoria-imobiliaria.md`
3. `docs/backlog-por-sprints.md`
4. `docs/arquitetura-banco-rotas.md`
5. `docs/estrutura-inicial-do-projeto.md`
6. `docs/ai/AGENT-CONFIG.md`
7. `docs/ai/AGENT-CONTEXT-PROTOCOL.md`
8. `docs/ai/MODEL-HANDOFF-TEMPLATE.md`
9. `.agents/README.md`
10. `.agents/agents/<papel>.md` e `.agents/workflows/<workflow>.md` relevantes ao trabalho
11. `.agents/workflows/seo.md` para qualquer alteracao em paginas, conteudo, navegacao ou dados publicos
12. `.agents/workflows/security.md` para qualquer alteracao de codigo, dados, infraestrutura ou configuracao

## Regras Basicas

- A especificacao e a arquitetura sao a fonte de verdade.
- `.agents` e a camada operacional do repositorio.
- `tmp/context` e descartavel e deve existir por tarefa complexa.
- `tmp/tarefas` controla o estado das entregas.
- Nao editar arquivos fora do escopo sem confirmar conflito e necessidade.
- Toda entrega precisa terminar com testes e handoff.
- Toda funcionalidade, pagina, conteudo ou alteracao publica deve seguir obrigatoriamente
  `.agents/workflows/seo.md`. SEO tecnico, semantica, indexabilidade, metadata, dados
  estruturados, performance e linkagem interna fazem parte do criterio de pronto, nao sao
  uma etapa opcional posterior.
- Toda alteracao deve seguir obrigatoriamente `.agents/workflows/security.md`. Seguranca,
  privacidade, menor privilegio, validacao, autenticacao, autorizacao, protecao contra
  abuso, atualizacao de dependencias e testes negativos fazem parte do criterio de pronto.
- Nenhum bypass de desenvolvimento, credencial fixa, segredo em codigo ou autorizacao
  baseada apenas na interface pode ser introduzido.

## Como Trabalhar

1. Ler o contexto do produto antes de programar.
2. Criar ou atualizar o pacote de contexto da tarefa quando houver multiagentes, risco ou muitas alteracoes.
3. Separar responsabilidade por dominio.
4. Registrar decisoes, testes e riscos.
5. Validar o resultado antes de concluir.
6. Executar o checklist SEO sempre que a entrega afetar a superficie publica.
7. Executar o checklist de seguranca em toda entrega e envolver o `security-auditor`
   quando houver auth, dados pessoais, uploads, APIs, banco, infraestrutura ou secrets.

## Orientacao Do Produto

Este repositorio e para uma assessoria imobiliaria com site publico, painel administrativo, gestao de imoveis e forte foco em visual premium, SEO local e operacao simples.
