# Especificacao Mestre - Site da Assessoria Imobiliaria

> Documento base para planejamento, construcao e manutencao de um site de assessoria imobiliaria com area publica, painel administrativo e operacao orientada a multiagentes de IA.

## Metadados

- **Versao:** 1.0
- **Status:** Draft inicial
- **Idioma:** PT-BR
- **Publico-alvo:** agentes de IA, devs, QA, produto e operacao
- **Objetivo:** definir uma base unica para criar um site moderno, bonito, rapido, barato de manter e com controle total do conteudo pela propria assessoria imobiliaria

## 1. Como Ler Este Documento

### 1.1 Regras para agentes

1. Ler este documento por inteiro antes de iniciar qualquer tarefa.
2. Tratar os IDs de requisito como contratos. Se um requisito mudar, atualizar o documento antes de implementar.
3. Cada agente deve trabalhar com escopo pequeno, arquivos bem delimitados e uma unica responsabilidade principal.
4. Nao assumir comportamento nao descrito aqui. Se houver ambiguidade, registrar a duvida e criar uma decisao de arquitetura.
5. Nenhuma entrega deve ser considerada pronta sem testes automatizados pertinentes ao escopo.
6. Toda mudanca deve vir acompanhada de notas de handoff: o que foi feito, o que foi testado, o que ficou pendente.

### 1.2 Formato esperado de cada tarefa de agente

Cada tarefa deve ser registrada no formato:

- **ID:** identificador unico
- **Objetivo:** resultado esperado
- **Entradas:** arquivos, dados ou decisoes necessarias
- **Saidas:** artefatos produzidos
- **Dependencias:** tarefas que precisam terminar antes
- **Testes:** suites e cenarios obrigatorios
- **Aceite:** criterios objetivos de pronto

### 1.3 Contrato de handoff

Antes de passar a tarefa para outro agente, deixar sempre:

- resumo curto do que foi alterado
- lista de arquivos impactados
- testes executados e resultado
- riscos abertos
- proximos passos recomendados

---

## 2. Visao do Produto

O produto sera um site institucional e operacional de uma assessoria imobiliaria, com dois grandes blocos:

1. **Area publica**
   - apresenta a assessoria imobiliaria, seus servicos e seus imoveis
   - converte visitantes em leads
   - reforca credibilidade e SEO local

2. **Area administrativa**
   - permite ao dono da assessoria imobiliaria gerenciar os dados do site
   - permite cadastrar, editar, destacar, ocultar e vender imoveis
   - controla conteudos institucionais, banners, depoimentos e contatos

O sistema deve ser:

- moderno no visual
- rapido no carregamento
- simples de operar por pessoas nao tecnicas
- barato de hospedar
- seguro por padrao
- preparado para crescer sem reescrita

---

## 3. Premissas e Decisoes Base

### 3.1 Premissas do negocio

- O site tera poucas pessoas acessando ao mesmo tempo.
- O foco principal e gerar contatos e mostrar imoveis com credibilidade.
- O dono da assessoria imobiliaria precisa editar informacoes sem depender de desenvolvedor.
- O volume de conteudo sera moderado, com fotos como principal peso de armazenamento.

### 3.2 Decisoes de produto

- O conteudo institucional sera editavel em um painel.
- Os imoveis terao CRUD completo.
- O site tera SEO forte por pagina e por bairro/regiao.
- Haverá fluxo rapido para WhatsApp e formulario de lead.
- O visual precisa parecer premium, confiavel e atual.

### 3.3 Decisoes de arquitetura

- Evitar CMS pesado e generico se ele nao trouxer valor real.
- Preferir um painel proprio, simples, focado no dominio da assessoria imobiliaria.
- Separar claramente frontend publico, admin, dominio de dados e testes.
- Automatizar tudo que for repetitivo: validacao, build, teste, deploy e publicacao.

---

## 4. Objetivos do Produto

### 4.1 Objetivos primarios

- Exibir a assessoria imobiliaria com imagem profissional.
- Centralizar a gestao dos conteudos do site.
- Centralizar a gestao de imoveis.
- Gerar leads com friccao minima.
- Manter custo operacional baixo.

### 4.2 Objetivos secundarios

- Melhorar visibilidade organica no Google.
- Permitir escalar o site com novos bairros, categorias e conteudos.
- Facilitar futuras integracoes com CRM, email marketing e automacao.

### 4.3 Nao objetivos do MVP

- Marketplace com negociacao entre terceiros.
- Chat interno complexo.
- Portal financeiro.
- Funcionalidades de ERP.
- Regras sofisticadas de comissao.

---

## 5. Publico e Perfis de Uso

### 5.1 Visitante

Pessoa que entra no site para:

- buscar imoveis
- comparar opcoes
- entender a assessoria imobiliaria
- falar com um corretor

### 5.2 Lead

Pessoa interessada que:

- preenche formulario
- chama no WhatsApp
- pede visita
- solicita mais informacoes

### 5.3 Admin da assessoria imobiliaria

Usuario com permissoes para:

- editar conteudo do site
- cadastrar e atualizar imoveis
- publicar e ocultar paginas
- receber e acompanhar leads

### 5.4 Editor/operador interno

Usuario com acesso restrito para:

- atualizar fotos
- revisar textos
- administrar parte do cadastro

---

## 6. Escopo Funcional

### 6.1 Area publica

#### REQ-PUB-001 - Home

A home deve:

  - apresentar a proposta da assessoria imobiliaria
- ter busca de imoveis em destaque
- exibir imoveis em evidencia
- mostrar diferenciais e prova social
- conduzir para WhatsApp e formulario

#### REQ-PUB-002 - Listagem de imoveis

A pagina de listagem deve:

- listar imoveis ativos
- suportar filtros por tipo, preco, bairro, dormitorios, vagas, area e status
- ter ordenacao por destaque, preco e data
- funcionar bem no mobile

#### REQ-PUB-003 - Pagina de detalhe do imovel

A pagina do imovel deve:

- exibir galeria de imagens
- mostrar preco, dados principais e descricao
- ter CTA de WhatsApp e contato
- mostrar mapa ou referencia de localizacao quando disponivel
- sugerir imoveis relacionados

#### REQ-PUB-004 - Paginas institucionais

As paginas institucionais devem incluir:

- sobre a assessoria imobiliaria
- servicos
- contato
- quero vender meu imovel
- avaliacao de imovel
- areas atendidas

#### REQ-PUB-005 - SEO local

O site deve suportar paginas por:

- cidade
- bairro
- tipo de imovel
- servico

#### REQ-PUB-006 - Contato e conversao

O site deve ter:

- botao fixo de WhatsApp
- formulario de contato
- possibilidade de clicar para ligar
- envio de lead para o painel

### 6.2 Area administrativa

#### REQ-ADM-001 - Autenticacao

O painel deve permitir:

- login seguro
- logout
- recuperacao de acesso
- controle de sessao

#### REQ-ADM-002 - Gestao de imoveis

O admin deve permitir:

- criar, editar, publicar, ocultar e excluir imoveis
- controlar status como disponivel, reservado e vendido
- marcar como destaque
- editar slug, titulo, preco e descricao

#### REQ-ADM-003 - Gestao de imagens

O admin deve permitir:

- upload de multiplas imagens
- reordenacao de imagens
- remocao de imagens
- marcacao de imagem principal

#### REQ-ADM-004 - Gestao de conteudo institucional

O admin deve permitir:

- editar textos de paginas
- atualizar blocos da home
- editar banners e chamadas
- gerenciar depoimentos

#### REQ-ADM-005 - Gestao de leads

O admin deve permitir:

- visualizar leads recebidos
- filtrar por status
- marcar como tratado
- registrar observacoes internas

#### REQ-ADM-006 - Gestao de SEO

O admin deve permitir:

- editar title e description
- editar Open Graph
- editar slug quando permitido
- preencher texto alternativo das imagens

#### REQ-ADM-007 - Gestao de usuarios e permissoes

O admin deve permitir:

- criar usuarios internos
- limitar permissoes por papel
- bloquear acessos indevidos

---

## 7. Sitemap Proposto

| Codigo | Pagina | Objetivo | Fonte de dados |
| --- | --- | --- | --- |
| PUB-01 | Home | Apresentacao da assessoria imobiliaria e entrada para busca | settings, destaque, imoveis |
| PUB-02 | Imoveis | Listagem filtravel | properties |
| PUB-03 | Imovel /[slug] | Detalhe completo do imovel | properties, property_images |
| PUB-04 | Sobre | Historia, credibilidade e equipe | pages |
| PUB-05 | Servicos | Explicar servicos da assessoria imobiliaria | pages |
| PUB-06 | Quero vender | Captacao de leads de proprietarios | pages, leads |
| PUB-07 | Avaliacao | Solicitar avaliacao de imovel | pages, leads |
| PUB-08 | Areas atendidas | SEO local e contexto regional | neighborhoods, pages |
| PUB-09 | Blog | Conteudo e autoridade | blog_posts |
| PUB-10 | Contato | Canais diretos de contato | settings, leads |
| ADM-01 | Login | Entrada segura no painel | auth |
| ADM-02 | Dashboard | Visao geral operacional | analytics, leads, properties |
| ADM-03 | Imoveis | CRUD completo | properties |
| ADM-04 | Conteudos | Blocos, paginas e banners | pages, site_blocks |
| ADM-05 | Leads | Lista e tratamento | leads |
| ADM-06 | Usuarios | Permissoes e acessos | users, roles |
| ADM-07 | SEO | Metadados e indexacao | seo_meta |

---

## 8. Experiencia e Direcao Visual

### 8.1 Direcao de design

O visual deve seguir uma linha:

- editorial
- sofisticada
- limpa
- confiavel
- com foco em fotografia

### 8.2 Componentes visuais principais

- hero com imagem grande e CTA
- cards de imoveis com foto forte e badges
- filtros de busca claros
- seções com depoimentos
- blocos de prova social
- galerias com visualizacao ampliada
- formularios com feedback instantaneo
- rodape completo com dados da empresa

### 8.3 Regras de interface

- mobile first
- contraste adequado
- tipografia legivel
- espacamento generoso
- animacoes sutis e funcionais
- sem excesso de efeitos decorativos
- sem layout generico de template pronto

### 8.4 Sistema de design

O sistema visual deve ter:

- tokens de cor
- tokens de espacamento
- tipografia consistente
- variantes de botao
- estado de erro, sucesso e carregamento
- componentes reutilizaveis para forms e cards

### 8.5 Marca e paleta base

#### 8.5.1 Logo principal

- Usar o lockup horizontal com monograma `LM` e wordmark `LUANA MODOTTE`.
- Asset base salvo em `assets/brand/luana-modotte-logo-lockup.png`.
- Preferir a versao com fundo azul-marinho profundo quando a marca precisar parecer mais institucional.
- Em fundos claros, usar uma versao adaptada com fundo transparente ou branco neutro.
- Nao distorcer, inclinar, condensar ou aplicar efeitos fora da linguagem da marca.
- Nao usar cores fora da paleta oficial sem aprovacao.

#### 8.5.2 Paleta oficial sugerida

| Papel | Hex | Uso recomendado |
| --- | --- | --- |
| Navy primario | `#0B1B2C` | fundo principal, header, hero e areas de destaque |
| Navy profundo | `#13253B` | gradientes, cards escuros e abas de navegacao |
| Champagne gold | `#CBB28C` | logo, botoes primarios, destaques e linhas finas |
| Ivory | `#F4EADF` | fundos claros, textos sobre fundo escuro e superficies premium |
| Beige quente | `#D9C7B0` | cards, bordas sutis e areas de apoio |
| Taupe | `#9D8468` | textos secundarios, detalhes e estados neutros |

#### 8.5.3 Lema oficial

- `O seu coração escolhe o lar. Nossa assessoria garante o negócio.`

#### 8.5.4 Direcao de tom

- sofisticado
- acolhedor
- confiavel
- tecnico sem ser frio
- humano sem perder autoridade

#### 8.5.5 Aplicacao pratica

- O site deve priorizar fundo navy, tipografia em ivory e acentos em champagne gold.
- Componentes de conversao devem usar contraste alto e leitura imediata.
- Fotos dos imoveis devem respirar dentro de superficies neutras para nao competir com a marca.
- O logo deve aparecer com bastante respiro, especialmente em header e rodape.

---

## 9. Arquitetura Tecnica

### 9.1 Stack recomendada

| Camada | Tecnologia | Motivo |
| --- | --- | --- |
| Frontend | Next.js com App Router | moderno, SEO forte, SSR/SSG e ecossistema maduro |
| Linguagem | TypeScript | reduz bugs e melhora manutencao |
| Estilo | Tailwind CSS | velocidade de implementacao e consistencia visual |
| Componentes | shadcn/ui + Radix | componentes acessiveis e controlaveis |
| Icones | Lucide | leve e consistente |
| Estado | Server Components + Server Actions + client state minimo | reduz complexidade |
| Banco | PostgreSQL via Supabase | relacional, gerenciavel e barato para este porte |
| Auth | Supabase Auth | integrado ao banco e simples de operar |
| Storage | Supabase Storage ou equivalente | facilita upload e entrega de imagens |
| Deploy | Cloudflare Workers | custo baixo e deploy simples via Git |
| CI | GitHub Actions | automatiza testes e build |
| E2E | Playwright | cobre fluxos reais do usuario |
| Unit tests | Vitest | rapido e flexivel |
| Component docs | Storybook | ajuda agentes e humanos a validar UI |

### 9.2 Fluxo de aplicacao

1. Visitante acessa a area publica.
2. As paginas publicas usam dados cacheados e revalidacao sob demanda quando necessario.
3. O admin autentica e acessa rotas protegidas.
4. O painel grava dados em Postgres.
5. Mudancas de conteudo disparam revalidacao das paginas afetadas.
6. Upload de imagens vai para storage.
7. Leads entram no banco e podem ser consultados no admin.

### 9.3 Estrutura sugerida de pastas

```text
src/
  app/
  components/
  features/
  lib/
  server/
  styles/
  types/
tests/
  e2e/
  integration/
  unit/
docs/
```

### 9.4 Regras tecnicas

- evitar acoplamento entre UI e acesso direto ao banco
- encapsular regras de negocio em servicos
- manter validacao no frontend e no backend
- usar migracoes versionadas
- manter policies de acesso em banco
- nao depender de variaveis globais escondidas

---

## 10. Modelo de Dados

### 10.1 Entidades centrais

#### `site_settings`

Campos sugeridos:

- id
- company_name
- legal_name
- logo_url
- favicon_url
- primary_phone
- secondary_phone
- whatsapp_number
- email
- address
- city
- state
- social_links
- opening_hours
- default_seo_title
- default_seo_description

#### `pages`

Campos sugeridos:

- id
- slug
- title
- subtitle
- body
- page_type
- hero_image_url
- is_published
- seo_title
- seo_description
- og_image_url
- updated_at

#### `properties`

Campos sugeridos:

- id
- slug
- title
- transaction_type
- property_type
- status
- featured
- price
- price_on_request
- description
- address
- neighborhood
- city
- state
- zip_code
- latitude
- longitude
- bedrooms
- bathrooms
- garages
- area_total
- area_useful
- condominium_fee
- iptu_value
- built_year
- furnished
- contact_phone
- contact_whatsapp
- seo_title
- seo_description
- published_at
- created_at
- updated_at

#### `property_images`

Campos sugeridos:

- id
- property_id
- url
- alt_text
- sort_order
- is_cover
- width
- height
- created_at

#### `leads`

Campos sugeridos:

- id
- name
- email
- phone
- source
- interest_type
- property_id
- page_slug
- message
- status
- notes
- created_at
- updated_at

#### `testimonials`

Campos sugeridos:

- id
- name
- role
- message
- avatar_url
- is_published
- sort_order

#### `users` / `roles`

Campos sugeridos:

- id
- auth_user_id
- role
- name
- active
- created_at

### 10.2 Regras de integridade

- um imovel pode ter varias imagens
- uma imagem deve ser a capa
- apenas imoveis publicados podem aparecer no site publico
- leads nao podem ser apagados sem trilha de auditoria
- campos de SEO precisam de defaults caso estejam vazios
- alteracoes de status devem registrar data e responsavel

### 10.3 Auditoria recomendada

Registrar:

- quem alterou
- quando alterou
- o que mudou
- antes e depois quando aplicavel

---

## 11. Organizacao Multiagente

### 11.1 Papéis dos agentes

#### Agente Orquestrador

- quebra o trabalho em pacotes
- controla dependencias
- impede sobreposicao desnecessaria
- valida se as entregas atendem aos criterios do documento

#### Agente de Arquitetura

- define padroes
- registra decisoes tecnicas
- revisa riscos
- valida consistencia entre frontend, backend e dados

#### Agente de UI

- constrói o sistema visual
- implementa componentes e paginas
- garante responsividade e consistencia

#### Agente de Dados

- modela tabelas
- cria migracoes
- define regras de integridade
- apoia policies e segurança

#### Agente de Admin

- constrói as telas internas
- implementa CRUDs
- garante experiencia simples para o operador

#### Agente de QA

- cria e mantem testes
- executa suites
- valida criticos de negocio
- abre bugs com reproducoes precisas

#### Agente de DevOps

- configura deploy
- CI
- variaveis de ambiente
- monitoramento e logs

#### Agente de Conteudo e SEO

- estrutura textos
- define metas SEO
- organiza paginas por bairro e servico

### 11.2 Regra de distribuicao de trabalho

Cada work package deve ter:

- um responsavel principal
- um revisor
- um conjunto fechado de testes
- um criterio de aceitação objetivo

### 11.3 Regra contra conflito de edicao

- dois agentes nao devem editar o mesmo arquivo ao mesmo tempo sem coordenacao
- arquivos de dominio devem ter ownership claro
- se houver conflito, o orquestrador decide a ordem

---

## 12. Plano de Implementacao por Work Package

### WP-00 Fundacao

Entregas:

- estrutura do projeto
- lint
- formatacao
- typecheck
- pipeline de CI
- ambiente local
- convencoes do repo

Testes:

- lint
- typecheck
- build

### WP-01 Design System

Entregas:

- tokens
- tipografia
- cores
- botoes
- inputs
- cards
- modais
- alertas
- estados de carregamento

Testes:

- stories
- snapshot visual
- a11y em componentes base

### WP-02 Area Publica

Entregas:

- home
- listagem
- detalhe do imovel
- paginas institucionais
- SEO base

Testes:

- unitarios de renderizacao
- e2e de navegação
- performance baseline

### WP-03 Admin

Entregas:

- login
- dashboard
- CRUD de imoveis
- upload de imagens
- edicao de paginas
- gestao de leads

Testes:

- e2e dos fluxos criticos
- integracao com banco
- autorizacao por papel

### WP-04 Dados e Regras

Entregas:

- esquema do banco
- policies
- validacoes
- servicos de dominio

Testes:

- migracoes
- integracao
- regras de permissao

### WP-05 Conversao e Integracoes

Entregas:

- WhatsApp
- formulario
- email
- mapa
- analytics

Testes:

- submissao de lead
- entrega de evento
- validacao de payload

### WP-06 Qualidade, Observabilidade e Lancamento

Entregas:

- monitoramento
- logs
- analise de erros
- smoke tests
- checklist de publicacao

Testes:

- smoke
- regressao
- accessibility
- visual

---

## 13. Estrategia de Testes

### 13.1 Piramide de testes

1. **Unit tests**
   - regras de negocio
   - validacao de formulários
   - helpers de SEO
   - normalizacao de dados

2. **Integration tests**
   - interacao com banco
   - servicos de imoveis
   - publicacao e ocultacao
   - criacao e atualizacao de lead

3. **E2E tests**
   - fluxo do visitante
   - fluxo do lead
   - fluxo do admin
   - permissao e acesso

4. **Visual regression**
   - home
   - listagem
   - pagina do imovel
   - formulários do admin

5. **Accessibility**
   - navegação por teclado
   - labels
   - contraste
   - foco visivel

6. **Performance**
   - carregamento inicial
   - peso das imagens
   - tempo de resposta
   - eficiencia de cache

7. **Security**
   - autenticacao
   - autorizacao
   - policies do banco
   - sanitizacao de entrada

### 13.2 Suites obrigatorias

- `lint`
- `typecheck`
- `unit`
- `integration`
- `e2e`
- `build`
- `a11y`
- `visual`
- `smoke`

### 13.3 Fluxo de CI

Ordem minima recomendada:

1. instalar dependencias
2. lint
3. typecheck
4. unit tests
5. integration tests
6. build
7. e2e
8. accessibility
9. visual regression
10. publicar apenas se tudo passar

### 13.4 Casos criticos que nunca podem quebrar

- visitante ver a home
- visitante listar imoveis
- visitante abrir detalhe de imovel
- visitante enviar lead
- admin entrar no painel
- admin criar imovel
- admin subir imagens
- admin publicar e ocultar imovel
- admin editar conteudo da home
- mudanca de conteudo refletir no site publico

### 13.5 Critérios minimos de aceite para producao

- build sem erro
- testes criticos verdes
- nenhuma regressao visual em paginas principais
- nenhuma falha de permissao de acesso
- nenhum formulario critico sem validação
- pagina publica responsiva no mobile
- conteudo administravel pelo painel

### 13.6 Matriz minima de cobertura

| Fluxo critico | Unit | Integration | E2E | A11y | Visual |
| --- | --- | --- | --- | --- | --- |
| Home publica | sim | opcional | sim | sim | sim |
| Listagem de imoveis | sim | opcional | sim | sim | sim |
| Detalhe do imovel | sim | opcional | sim | sim | sim |
| Envio de lead | sim | sim | sim | sim | opcional |
| Login do admin | sim | sim | sim | sim | opcional |
| Criacao de imovel | sim | sim | sim | sim | opcional |
| Upload e ordenacao de imagens | sim | sim | sim | sim | opcional |
| Publicar e ocultar conteudo | sim | sim | sim | sim | opcional |
| Edicao de conteudo institucional | sim | sim | sim | sim | opcional |

---

## 14. Qualidade, Seguranca e Confiabilidade

### 14.1 Requisitos de qualidade

- interfaces consistentes
- mensagens de erro claras
- formulários com validacao imediata e server-side
- loading states e empty states bem definidos
- SEO e metadados por pagina

### 14.2 Requisitos de seguranca

- acesso administrativo autenticado
- role-based access control
- policies de banco para evitar acesso indevido
- upload com validacao de tipo e tamanho
- protecao contra input malicioso
- secrets fora do repositorio

### 14.3 Requisitos de confiabilidade

- backup de dados
- rastreabilidade de alteracoes
- logs de erro
- pagina de erro amigavel
- comportamento resiliente em falha de integracao

---

## 15. Deploy, Operacao e Custo

### 15.1 Estrategia de hospedagem

Recomendacao base:

- aplicacao em hosting serverless com deploy via Git
- banco em plataforma gerenciada
- storage de imagens no mesmo ecossistema ou em storage dedicado de baixo custo

### 15.2 Objetivo de custo

O sistema deve ser desenhado para:

- baixo custo fixo mensal
- poucas dependencias pagas
- pouca manutencao operacional
- escala suficiente para tráfego pequeno e moderado

### 15.3 Operacao diaria

O dono da assessoria imobiliaria deve conseguir:

- subir conteudo sem ajuda tecnica
- editar imoveis sem suporte
- revisar leads rapidamente
- trocar destaque da home
- pausar ou publicar paginas

### 15.4 Observabilidade

O sistema deve registrar:

- erros de aplicacao
- falhas de envio de lead
- falhas de upload
- problemas de autorizacao
- tempo de resposta das rotas criticas

---

## 16. Requisitos de SEO

### 16.1 SEO tecnico

- title e description por pagina
- headings corretos
- sitemap.xml
- robots.txt
- canonical onde necessario
- dados estruturados quando aplicavel

### 16.2 SEO de conteudo

- paginas por bairro
- paginas por servico
- descricoes claras de imoveis
- textos institucionais consistentes
- linkagem interna bem pensada

### 16.3 SEO local

- endereco padronizado
- telefone e WhatsApp visiveis
- areas atendidas
- sinais de confianca e localizacao

---

## 17. Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
| --- | --- | --- |
| Escopo crescer demais | atraso | manter MVP com fases claras |
| Admin ficar complexo | baixa adesao | priorizar simplicidade e poucos cliques |
| Fotos pesadas | lentidao | compressao, redimensionamento e lazy loading |
| Falta de testes | regressao | gates obrigatorios no CI |
| Permissoes mal definidas | risco de seguranca | RBAC e policies no banco |
| Conteudo sem padrao | site inconsistente | design system e componentes reaproveitaveis |
| Dependencia de um unico operador | gargalo | perfis de acesso e documentacao |

---

## 18. Definicao de Pronto

Uma entrega so pode ser considerada pronta quando:

- requisito implementado conforme documento
- testes do escopo passaram
- responsividade verificada
- acessibilidade minima aprovada
- desempenho aceitavel no fluxo critico
- sem erros de build
- sem conflitos de permissao
- documentacao atualizada se necessario

---

## 19. Sequencia Recomendada de Execucao

1. fechar identidade visual e conteudos base
2. criar fundacao tecnica e pipeline
3. montar design system
4. construir area publica
5. construir admin e auth
6. conectar banco, storage e policies
7. adicionar testes completos
8. validar SEO e performance
9. fazer smoke final e publicar
10. treinar o dono da assessoria imobiliaria

---

## 20. Referencias Tecnicas Oficiais

- Next.js App Router: https://nextjs.org/docs/app
- Tailwind CSS v4: https://tailwindcss.com/blog/tailwindcss-v4
- shadcn/ui: https://ui.shadcn.com/docs
- Supabase: https://supabase.com/
- Supabase billing: https://supabase.com/docs/guides/platform/billing-on-supabase
- Supabase Storage: https://supabase.com/docs/guides/storage
- Cloudflare Workers + Next.js: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Playwright: https://playwright.dev/docs/intro
- Vitest: https://vitest.dev/guide/
- Storybook: https://storybook.js.org/docs

---

## 21. Observacoes Finais

Este documento deve ser tratado como base viva do produto. Quando houver mudanca de escopo, tecnologia ou prioridades, atualizar esta especificacao antes de iniciar a implementacao.

---

## 22. Artefatos Complementares

- Backlog por sprints: [docs/backlog-por-sprints.md](docs/backlog-por-sprints.md)
- Arquitetura de banco e rotas: [docs/arquitetura-banco-rotas.md](docs/arquitetura-banco-rotas.md)
- Estrutura inicial do projeto: [docs/estrutura-inicial-do-projeto.md](docs/estrutura-inicial-do-projeto.md)
