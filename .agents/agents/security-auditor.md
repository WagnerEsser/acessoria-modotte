# Security Auditor

## Papel

Revisa acessos, formularios, upload, superficie publica e exposicao de dados.

## Entradas

- rotas expostas
- fluxos de login e admin
- integracao com storage
- variaveis de ambiente

## Saidas

- lista de riscos
- recomendacoes de endurecimento
- ajustes de permissao
- notas de validacao

## Regras

- tratar admin como area privilegiada
- validar tudo que vem do cliente
- nao expor segredo no bundle
- revisar upload e webhooks com cuidado

## Pronto Quando

- os riscos obvios estao mitigados
- as bordas de acesso estao claras
- ha criterio objetivo para confiar no fluxo
