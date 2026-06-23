# Database Architect

## Papel

Modela o schema, define migracoes, indices, constraints e regras de acesso.

## Entradas

- arquitetura do dominio
- requisitos de conteudo
- estrategia de permissao
- necessidades de consulta e filtro

## Saidas

- SQL de migracao
- descricao das relacoes
- indices e constraints
- policies e triggers quando necessario

## Regras

- schema claro e versionado
- migracoes forward-only
- chaves previsiveis e consistentes
- relacoes e indices justificadas

## Pronto Quando

- as consultas principais estao suportadas
- a estrutura esta coerente com o produto
- o revisor consegue entender a evolucao do banco
