# Backlog Por Sprints - Assessoria Imobiliaria

> Backlog operacional para execução por multiagentes. Cada sprint tem entregáveis fechados, dependencias claras e testes obrigatorios.

## Regras de Execucao

- Trabalhar em sprints curtos e entregas pequenas.
- Cada tarefa deve ter um agente primario e um revisor.
- Nao iniciar tarefas dependentes antes de concluir a base.
- Toda tarefa precisa terminar com testes e handoff.
- Nenhuma tarefa e concluida sem criterio de aceite objetivo.

## Estrutura de Status

- `P0` = bloqueia o projeto
- `P1` = critica
- `P2` = importante
- `P3` = desejavel

## Sprint 0 - Fundacao Tecnica

### Objetivo

Estabelecer o repositorio, convencoes, pipeline e ambiente base.

### Entregaveis

| ID | Tarefa | Agente primario | Dependencias | Testes | Criterio de aceite |
| --- | --- | --- | --- | --- | --- |
| SP0-01 | Definir estrutura inicial do repo e padroes de pasta | Orquestrador | nenhum | review estrutural | arvores de pasta documentadas e criadas |
| SP0-02 | Configurar lint, formatacao e typecheck | DevOps | SP0-01 | lint, typecheck | comandos executam sem erro localmente |
| SP0-03 | Definir ambiente e variaveis sensiveis | Arquitetura | SP0-01 | validacao de env | lista de variaveis fechada e documentada |
| SP0-04 | Criar padrao de handoff entre agentes | Orquestrador | SP0-01 | review documental | template pronto para reuso por qualquer agente |

### Definition of Done

- Repo com estrutura inicial visivel.
- Regras de trabalho documentadas.
- Sem ambiguidade sobre ownership de arquivos.

## Sprint 1 - Identidade e Sistema Visual

### Objetivo

Traduzir a marca em sistema visual consistente e reaproveitavel.

### Entregaveis

| ID | Tarefa | Agente primario | Dependencias | Testes | Criterio de aceite |
| --- | --- | --- | --- | --- | --- |
| SP1-01 | Consolidar paleta e tokens de design | UI | SP0-01 | review visual | tokens aprovados e consistentes com a logo |
| SP1-02 | Criar biblioteca base de componentes | UI | SP1-01 | storybook/a11y | botoes, inputs, cards e dialogs prontos |
| SP1-03 | Definir header, footer e shell de paginas | UI | SP1-02 | visual, responsivo | layout base responsivo em mobile e desktop |
| SP1-04 | Aplicar direcao de marca em hero e CTAs | Conteudo + UI | SP1-01 | visual | home ganha leitura premium e coerente |

### Definition of Done

- A marca esta traduzida em cores, tipografia e espacos.
- Componentes reutilizaveis cobrem os casos principais.

## Sprint 2 - Area Publica

### Objetivo

Entregar o site publico com foco em conversao, SEO e leitura rapida.

### Entregaveis

| ID | Tarefa | Agente primario | Dependencias | Testes | Criterio de aceite |
| --- | --- | --- | --- | --- | --- |
| SP2-01 | Implementar home publica | UI | SP1-03 | e2e, visual | home carrega e converte para busca/contato |
| SP2-02 | Implementar listagem de imoveis | UI | SP2-01 | unit, e2e | filtros e ordenacao funcionam |
| SP2-03 | Implementar pagina de detalhe do imovel | UI | SP2-02 | e2e, visual | galeria, dados e CTA funcionam |
| SP2-04 | Implementar paginas institucionais e SEO local | Conteudo + SEO | SP2-01 | unit, e2e | paginas indexaveis e com metadados corretos |
| SP2-05 | Implementar contato e conversao | UI + Backend | SP2-01 | integration, e2e | lead chega ao banco ou fila definida |

### Definition of Done

- Todas as rotas publicas principais existem.
- SEO minimo e conversao funcional.

## Sprint 3 - Dados, Auth e Regras de Negocio

### Objetivo

Estruturar banco, autenticacao, policies e servicos centrais.

### Entregaveis

| ID | Tarefa | Agente primario | Dependencias | Testes | Criterio de aceite |
| --- | --- | --- | --- | --- | --- |
| SP3-01 | Modelar banco e migracoes | Dados | SP0-03 | migration tests | schema versionado e coerente |
| SP3-02 | Definir relacoes, indices e constraints | Dados | SP3-01 | integration | consultas principais estao suportadas |
| SP3-03 | Implementar auth e roles | Backend | SP3-01 | integration, e2e | admin entra e acesso e protegido |
| SP3-04 | Implementar policies e seguranca de acesso | Backend | SP3-03 | security, integration | ninguem acessa o que nao pode |
| SP3-05 | Implementar pipeline de upload e storage | Backend | SP3-01 | integration | imagem sobe e fica associada ao imovel |

### Definition of Done

- Banco e seguranca estao coerentes com o produto.
- Regras de acesso nao dependem de convencao manual.

## Sprint 4 - Painel Administrativo

### Objetivo

Entregar o painel para o dono da assessoria operar o site.

### Entregaveis

| ID | Tarefa | Agente primario | Dependencias | Testes | Criterio de aceite |
| --- | --- | --- | --- | --- | --- |
| SP4-01 | Criar dashboard administrativo | UI | SP3-03 | e2e, visual | dashboard mostra resumo util |
| SP4-02 | Criar CRUD de imoveis | Admin | SP3-02 | integration, e2e | criar, editar, publicar e ocultar funciona |
| SP4-03 | Criar gestao de imagens | Admin | SP3-05 | integration, e2e | upload, ordenacao e capa funcionam |
| SP4-04 | Criar gestao de paginas e blocos de conteudo | Admin | SP3-01 | integration | home e institucionais ficam editaveis |
| SP4-05 | Criar gestao de leads e usuarios | Admin | SP3-03 | e2e, security | leads e acessos sao controlados no painel |

### Definition of Done

- O dono consegue operar o site sem suporte tecnico.
- Conteudo e imoveis podem ser mantidos de ponta a ponta.

## Sprint 5 - Qualidade, Observabilidade e Lancamento

### Objetivo

Blindar o sistema antes da publicacao.

### Entregaveis

| ID | Tarefa | Agente primario | Dependencias | Testes | Criterio de aceite |
| --- | --- | --- | --- | --- | --- |
| SP5-01 | Escrever suites E2E principais | QA | SP2-05, SP4-05 | e2e | fluxos criticos cobertos |
| SP5-02 | Cobrir acessibilidade e regressao visual | QA | SP1-02, SP2-01 | a11y, visual | sem quebra nas paginas principais |
| SP5-03 | Configurar logs, erros e monitoramento | DevOps | SP3-03 | smoke | falhas sao observaveis |
| SP5-04 | Criar checklist de deploy e rollback | DevOps | SP5-03 | review de processo | publicacao e reversao estao documentadas |
| SP5-05 | Fazer auditoria final de SEO e performance | SEO + QA | SP2-04 | performance, seo | pagina principal e rotas centrais estao otimizadas |

### Definition of Done

- O sistema esta pronto para publicar com risco reduzido.
- A equipe tem criterio claro para rollback e suporte.

## Sequencia Recomendada

1. Sprint 0
2. Sprint 1
3. Sprint 2
4. Sprint 3
5. Sprint 4
6. Sprint 5

## Template de Handoff

Cada agente deve entregar:

- `Objetivo`
- `Arquivos alterados`
- `Testes executados`
- `Resultado dos testes`
- `Riscos abertos`
- `Proximo agente sugerido`

