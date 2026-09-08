# AGENTS.md

Ponto de entrada para agentes de IA neste repositório.

## Ordem de leitura

1. `README.md`
2. Documentos atrelados ao `README.md`, especialmente os listados na seção `Documentação`
   e os documentos de deploy, ambiente, scripts ou operação citados nele
3. `docs/ai/AGENT_README.md`
4. `docs/especificacao-mestre-site-assessoria-imobiliaria.md`
5. `docs/backlog-por-sprints.md`
6. `docs/arquitetura-banco-rotas.md`
7. `docs/estrutura-inicial-do-projeto.md`
8. `docs/ai/AGENT-CONFIG.md`
9. `docs/ai/AGENT-CONTEXT-PROTOCOL.md`
10. `docs/ai/MODEL-HANDOFF-TEMPLATE.md`
11. `.agents/README.md`
12. `.agents/agents/<papel>.md` e `.agents/workflows/<workflow>.md` relevantes ao trabalho
13. `.agents/workflows/seo.md` para qualquer alteração em páginas, conteúdo, navegação ou dados públicos
14. `.agents/workflows/security.md` para qualquer alteração de código, dados, infraestrutura ou configuração

## Regras Básicas

- O `README.md` é a referência rápida para setup, execução local, Makefile, scripts,
  variáveis de ambiente e deploy.
- Qualquer mudança em comandos de execução, requisitos, scripts, variáveis de ambiente ou
  fluxo de deploy deve atualizar o `README.md` e os documentos atrelados aplicáveis.
- A especificação e a arquitetura são a fonte de verdade.
- `.agents` é a camada operacional do repositório.
- `tmp/context` é descartável e deve existir por tarefa complexa.
- `tmp/tarefas` controla o estado das entregas.
- Não editar arquivos fora do escopo sem confirmar conflito e necessidade.
- Toda entrega precisa terminar com testes e handoff.
- Toda funcionalidade, página, conteúdo ou alteração pública deve seguir obrigatoriamente
  `.agents/workflows/seo.md`. SEO técnico, semântica, indexabilidade, metadata, dados
  estruturados, performance e linkagem interna fazem parte do critério de pronto, não são
  uma etapa opcional posterior.
- Toda alteração deve seguir obrigatoriamente `.agents/workflows/security.md`. Segurança,
  privacidade, menor privilégio, validação, autenticação, autorização, proteção contra
  abuso, atualização de dependências e testes negativos fazem parte do critério de pronto.
- Nenhum bypass de desenvolvimento, credencial fixa, segredo em código ou autorização
  baseada apenas na interface pode ser introduzido.

## Como Trabalhar

1. Ler o contexto do produto antes de programar.
2. Criar ou atualizar o pacote de contexto da tarefa quando houver multiagentes, risco ou muitas alterações.
3. Separar responsabilidade por domínio.
4. Registrar decisões, testes e riscos.
5. Validar o resultado antes de concluir.
6. Executar o checklist SEO sempre que a entrega afetar a superfície pública.
7. Executar o checklist de segurança em toda entrega e envolver o `security-auditor`
   quando houver auth, dados pessoais, uploads, APIs, banco, infraestrutura ou secrets.

## Orientação Do Produto

Este repositório é para uma assessoria imobiliária com site público, painel administrativo, gestão de imóveis e forte foco em visual premium, SEO local e operação simples.
