# Arquitetura de Banco e Rotas - Assessoria Imobiliaria

> Documento tecnico para orientar implementacao por agentes. Foco em single-tenant, SEO-first, painel administrativo e regras fortes de acesso.

## Principios de Arquitetura

- Site unico para uma assessoria imobiliaria.
- Conteudo publicavel e administravel por painel.
- Banco relacional com relacionamentos explicitos.
- Upload de imagens separado do cadastro do imovel.
- Rotas publicas otimizadas para SEO.
- Rotas administrativas protegidas por autenticacao e permissao.
- Mudancas no painel devem revalidar as paginas publicas afetadas.
- Route groups do Next.js podem organizar o codigo, mas o caminho real do admin continua em `/admin/...`.

## Stack Base

- Frontend: Next.js com App Router
- Linguagem: TypeScript
- Estilo: Tailwind CSS
- Componentes: shadcn/ui
- Banco: PostgreSQL
- Auth: Supabase Auth ou equivalente
- Storage: armazenamento gerenciado de imagens
- Testes: Vitest, Playwright, testes de integracao

## Convenção Geral do Banco

- `id` como UUID.
- `created_at` e `updated_at` em tabelas mutaveis.
- `slug` unico em tabelas publicaveis.
- `is_published` para controle de publicacao.
- `sort_order` para ordenacao editorial.
- `deleted_at` apenas quando soft delete for necessario.
- `jsonb` apenas para dados verdadeiramente flexiveis.
- Nao duplicar textos que podem ser derivados.

## Tabelas Principais

### `site_settings`

Tabela singleton com configuracoes globais da marca.

Campos principais:

- `id`
- `company_name`
- `brand_name`
- `legal_name`
- `logo_url`
- `primary_color`
- `secondary_color`
- `accent_color`
- `primary_phone`
- `whatsapp_number`
- `email`
- `address`
- `city`
- `state`
- `social_links`
- `opening_hours`
- `default_seo_title`
- `default_seo_description`

### `pages`

Páginas institucionais e editoriais.

Campos principais:

- `id`
- `slug`
- `title`
- `subtitle`
- `body`
- `page_type`
- `hero_image_url`
- `is_published`
- `seo_title`
- `seo_description`
- `og_image_url`
- `created_at`
- `updated_at`

### `page_blocks`

Blocos editaveis da home e de paginas especiais.

Campos principais:

- `id`
- `page_id`
- `block_key`
- `title`
- `content`
- `media_url`
- `sort_order`
- `is_active`

### `neighborhoods`

Base de bairros e regioes para SEO local.

Campos principais:

- `id`
- `slug`
- `name`
- `city`
- `state`
- `intro_text`
- `seo_title`
- `seo_description`
- `is_published`

### `properties`

Cadastro central de imoveis.

Campos principais:

- `id`
- `slug`
- `title`
- `transaction_type`
- `property_type`
- `status`
- `is_published`
- `featured`
- `price`
- `price_on_request`
- `description`
- `address`
- `neighborhood_id`
- `city`
- `state`
- `zip_code`
- `latitude`
- `longitude`
- `bedrooms`
- `bathrooms`
- `garages`
- `area_total`
- `area_useful`
- `condominium_fee`
- `iptu_value`
- `built_year`
- `furnished`
- `contact_phone`
- `contact_whatsapp`
- `seo_title`
- `seo_description`
- `published_at`
- `created_at`
- `updated_at`

### `property_images`

Galeria do imovel.

Campos principais:

- `id`
- `property_id`
- `url`
- `alt_text`
- `sort_order`
- `is_cover`
- `width`
- `height`
- `created_at`

### `property_features`

Caracteristicas destacadas do imovel.

Campos principais:

- `id`
- `property_id`
- `label`
- `value`
- `sort_order`

### `leads`

Contatos gerados no site.

Campos principais:

- `id`
- `name`
- `email`
- `phone`
- `source`
- `interest_type`
- `property_id`
- `page_slug`
- `message`
- `status`
- `notes`
- `assigned_to`
- `created_at`
- `updated_at`

### `lead_notes`

Historico interno do atendimento.

Campos principais:

- `id`
- `lead_id`
- `author_id`
- `note`
- `created_at`

### `testimonials`

Depoimentos publicados no site.

Campos principais:

- `id`
- `name`
- `role`
- `message`
- `avatar_url`
- `is_published`
- `sort_order`

### `blog_categories`

Categorias de blog.

Campos principais:

- `id`
- `slug`
- `name`
- `is_published`

### `blog_posts`

Conteudo editorial e SEO.

Campos principais:

- `id`
- `slug`
- `title`
- `excerpt`
- `content`
- `category_id`
- `cover_image_url`
- `is_published`
- `seo_title`
- `seo_description`
- `published_at`
- `created_at`
- `updated_at`

### `users`

Perfil interno vinculado ao login do provedor.

Campos principais:

- `id`
- `auth_user_id`
- `name`
- `role`
- `active`
- `created_at`
- `updated_at`

### `audit_logs`

Registro de alteracoes relevantes.

Campos principais:

- `id`
- `actor_user_id`
- `entity_type`
- `entity_id`
- `action`
- `before_data`
- `after_data`
- `created_at`

## Relacoes

- `property_images.property_id -> properties.id`
- `property_features.property_id -> properties.id`
- `properties.neighborhood_id -> neighborhoods.id`
- `leads.property_id -> properties.id` opcional
- `lead_notes.lead_id -> leads.id`
- `lead_notes.author_id -> users.id`
- `page_blocks.page_id -> pages.id`
- `blog_posts.category_id -> blog_categories.id`
- `audit_logs.actor_user_id -> users.id`

## Indices e Constraints

- `pages.slug` unico.
- `properties.slug` unico.
- `neighborhoods.slug` unico.
- `blog_posts.slug` unico.
- `property_images(property_id, sort_order)`.
- `property_features(property_id, sort_order)`.
- `leads(status, created_at)`.
- `properties(status, is_published, featured)`.
- `users(auth_user_id)` unico.
- `audit_logs(entity_type, entity_id, created_at)`.

## Regras de Negocio no Banco

- Apenas um registro ativo em `site_settings`.
- Um imovel pode ter varias imagens, mas apenas uma imagem `is_cover = true`.
- Apenas um `page_block` ativo por `page_id + block_key` quando isso fizer sentido editorial.
- Um imovel publicado deve ter slug, titulo, status e ao menos uma imagem.
- Leads nunca devem ser apagados sem razao operacional documentada.
- Conteudos publicos devem ficar bloqueados se `is_published = false`.

## RLS e Permissoes

### Perfis sugeridos

- `admin`
- `editor`
- `support`
- `viewer`

### Regras gerais

- Publico anonimo pode ler apenas registros publicados.
- `admin` pode ler e escrever tudo.
- `editor` pode alterar conteudo e imoveis, mas nao permissao de usuarios.
- `support` pode ler leads e adicionar notas.
- `viewer` pode apenas consultar dados permitidos.

### Politicas minimas

- `properties`: leitura publica apenas dos publicados.
- `property_images`: leitura publica apenas via imoveis publicados.
- `pages`: leitura publica apenas das publicadas.
- `leads`: leitura apenas autenticada.
- `audit_logs`: acesso restrito a `admin`.

## Rotas Publicas

### Padrão

As rotas publicas devem viver sob um grupo de site e usar dados do banco com renderizacao no servidor.

### Mapa de rotas

| Rota | Funcao | Fonte principal | Observacao |
| --- | --- | --- | --- |
| `/` | Home | `site_settings`, `properties`, `testimonials`, `page_blocks` | rota de conversao principal |
| `/imoveis` | Lista de imoveis | `properties`, `neighborhoods` | filtros por query string |
| `/imoveis/[slug]` | Detalhe do imovel | `properties`, `property_images`, `property_features` | pagina SEO forte |
| `/sobre` | Sobre a assessoria | `pages` | conteudo institucional |
| `/servicos` | Servicos | `pages` | explicacao comercial |
| `/quero-vender` | Captacao de proprietarios | `pages`, `leads` | conversao de venda |
| `/avaliacao` | Avaliacao de imovel | `pages`, `leads` | lead qualificado |
| `/areas/[slug]` | SEO local | `neighborhoods`, `pages` | pagina por bairro/regiao |
| `/blog` | Listagem editorial | `blog_posts` | opcional no MVP |
| `/blog/[slug]` | Post editorial | `blog_posts` | opcional no MVP |
| `/contato` | Contato direto | `site_settings`, `leads` | telefone, whatsapp e formulario |

## Rotas Administrativas

### Padrão

As rotas administrativas devem ficar em grupo separado e exigir autenticacao.

### Mapa de rotas

| Rota | Funcao | Auth | Fonte principal |
| --- | --- | --- | --- |
| `/admin/login` | Login | nao | auth |
| `/admin` | Entrada do painel | sim | `leads`, `properties`, `pages` |
| `/admin/dashboard` | Resumo operacional | sim | agregacoes do banco |
| `/admin/imoveis` | Lista de imoveis | sim | `properties` |
| `/admin/imoveis/novo` | Novo imovel | sim | `properties` |
| `/admin/imoveis/[id]/editar` | Editar imovel | sim | `properties`, `property_images`, `property_features` |
| `/admin/conteudos` | Paginas e blocos | sim | `pages`, `page_blocks` |
| `/admin/leads` | Gerenciar leads | sim | `leads`, `lead_notes` |
| `/admin/usuarios` | Usuarios e papeis | sim | `users` |
| `/admin/seo` | Metadados e indexacao | sim | `pages`, `properties`, `blog_posts` |

## Endpoints e Server Actions

### Preferencia de implementacao

- Fluxos internos do admin devem usar Server Actions quando possivel.
- Endpoints `api` devem ser usados para integrações externas, webhooks e revalidacao.

### Actions centrais

- `createLead`
- `updateLeadStatus`
- `createProperty`
- `updateProperty`
- `publishProperty`
- `toggleFeaturedProperty`
- `uploadPropertyImage`
- `reorderPropertyImages`
- `updatePageContent`
- `updateSiteSettings`
- `updateSeoMeta`
- `createUser`
- `updateUserRole`

### APIs sugeridas

| Endpoint | Metodo | Funcao |
| --- | --- | --- |
| `/api/leads` | `POST` | criar lead publico |
| `/api/revalidate` | `POST` | revalidar rotas afetadas |
| `/api/webhooks/contact` | `POST` | integrações futuras |
| `/api/webhooks/storage` | `POST` | eventos de storage quando necessario |

## Revalidacao e Cache

- Alterou imovel publicado: revalidar `/imoveis`, `/imoveis/[slug]`, home e rota de bairro relacionada.
- Alterou pagina institucional: revalidar rota correspondente.
- Alterou `site_settings`: revalidar home, contato e rodape.
- Alterou imagem principal: revalidar rota do imovel e listagens relacionadas.
- Alterou blog: revalidar listagem e post individual.

## Seeds Minimos

### Conteudo inicial

- dados da assessoria
- pelo menos 3 imoveis exemplo
- pelo menos 2 bairros
- pelo menos 3 depoimentos
- paginas institucionais basicas

## Checklist de Aceite da Arquitetura

- schema definido.
- relacoes definidas.
- indices definidos.
- rotas publicas definidas.
- rotas administrativas definidas.
- estrategias de auth e RLS definidas.
- estrategia de revalidacao definida.
