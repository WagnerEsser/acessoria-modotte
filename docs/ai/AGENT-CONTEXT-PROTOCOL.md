# Agent Context Protocol

Este protocolo define como armazenar contexto de uma tarefa para que multiagentes trabalhem sem se atropelar.

## Quando Criar Um Contexto

Criar um pacote em `tmp/context` quando a tarefa:

- envolver mais de um agente
- tocar arquivos de mais de um dominio
- tiver mais de uma entrega ou sprint
- exigir registro formal de decisao
- tiver risco de regressao ou ambiguidade

## Estrutura Padrao

```text
tmp/context/<modelo>/<slug>/
  REQUEST.md
  SPEC.md
  PLAN.md
  AGENTS.md
  RESULTS.md
  HANDOFF.md
```

## Significado Dos Arquivos

- `REQUEST.md`: resumo do pedido e expectativa do resultado.
- `SPEC.md`: requisitos, limites e decisoes de produto.
- `PLAN.md`: sequencia de execucao, dependencias e checkpoints.
- `AGENTS.md`: quais agentes vao trabalhar e em qual ordem.
- `RESULTS.md`: o que foi entregue, o que foi testado e o que ficou pendente.
- `HANDOFF.md`: orientacao curta para o proximo agente ou para o revisor.

## Convencoes De Nome

- `modelo`: nome curto do modelo ou tipo de fluxo, por exemplo `gpt-5`.
- `slug`: identificador curto com data e assunto, por exemplo `2026-06-23-home-admin-scaffold`.

## Ciclo De Vida

1. Criar o pacote antes de executar trabalho grande.
2. Preencher a especificacao e o plano.
3. Registrar alocacao de agentes.
4. Executar e testar.
5. Registrar resultados e handoff.
6. Arquivar o contexto ou mover a tarefa para concluidas.

## Regra De Qualidade

Se o pacote de contexto nao permite reconstruir a decisao, ele ainda esta incompleto.
