insert into public.site_settings (
  singleton_key,
  company_name,
  brand_name,
  legal_name,
  logo_url,
  primary_color,
  secondary_color,
  accent_color,
  primary_phone,
  whatsapp_number,
  email,
  address,
  city,
  state,
  social_links,
  opening_hours,
  impact_phrase,
  default_seo_title,
  default_seo_description
)
values (
  'main',
  'Luana Modotte Assessoria Imobiliária',
  'Luana Modotte',
  'Luana Modotte Assessoria Imobiliária',
  null,
  '#0B1B2C',
  '#13253B',
  '#CBB28C',
  '5547988188967',
  '5547988188967',
  'luana.modotte@gmail.com',
  null,
  null,
  null,
  jsonb_build_object('instagram', 'https://instagram.com/luana.modotte'),
  '[]'::jsonb,
  'O seu coração escolhe o lar. Nossa assessoria garante o negócio.',
  'Luana Modotte | Assessoria Imobiliária',
  'O seu coração escolhe o lar. Nossa assessoria garante o negócio.'
)
on conflict (singleton_key) do update
set
  company_name = excluded.company_name,
  brand_name = excluded.brand_name,
  legal_name = excluded.legal_name,
  logo_url = excluded.logo_url,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  accent_color = excluded.accent_color,
  primary_phone = excluded.primary_phone,
  whatsapp_number = excluded.whatsapp_number,
  email = excluded.email,
  address = excluded.address,
  city = excluded.city,
  state = excluded.state,
  social_links = excluded.social_links,
  opening_hours = excluded.opening_hours,
  impact_phrase = excluded.impact_phrase,
  default_seo_title = excluded.default_seo_title,
  default_seo_description = excluded.default_seo_description;

insert into public.pages (
  slug,
  title,
  subtitle,
  body,
  page_type,
  is_published,
  seo_title,
  seo_description,
  sort_order
)
values (
  'home',
  'Assessoria imobiliária com atendimento próximo e condução segura.',
  'Uma presença digital leve para apresentar a marca, organizar informações e abrir conversas com clareza.',
  'Luana Modotte Assessoria Imobiliária foi pensada para um atendimento mais próximo, direto e bem orientado. O site nasce com estrutura enxuta, conteúdo essencial e espaço para crescer conforme a operação evoluir.',
  'home',
  true,
  'Luana Modotte | Assessoria Imobiliária',
  'Atendimento próximo, leitura técnica e condução segura em negócios imobiliários.',
  0
)
on conflict (slug) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  body = excluded.body,
  page_type = excluded.page_type,
  is_published = excluded.is_published,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  sort_order = excluded.sort_order;

with seeded_page as (
  insert into public.pages (
    slug,
    title,
    subtitle,
    body,
    page_type,
    is_published,
    seo_title,
    seo_description,
    sort_order
  )
  values (
    'sobre',
    'Sobre a assessoria',
    'Uma assessoria imobiliária nova, com contato direto, leitura técnica e condução objetiva.',
    $$Luana Modotte Assessoria Imobiliária nasce com uma proposta clara: conduzir negociações com proximidade, organização e segurança, sem transformar o processo em algo pesado para o cliente.

Cada atendimento parte de uma leitura real do momento de vida, do perfil do imóvel e das condições do negócio. A assessoria entra para organizar informações, reduzir ruído e manter a tomada de decisão bem orientada do início ao fechamento.

Mais do que apresentar imóveis, a atuação busca segurança documental, alinhamento de expectativa e negociação consistente, para que compra, venda ou avaliação aconteçam com mais tranquilidade.$$,
    'institutional',
    true,
    'Sobre | Luana Modotte Assessoria Imobiliária',
    'Conheça a proposta, a forma de atendimento e o posicionamento da assessoria.',
    10
  )
  on conflict (slug) do update
  set
    title = excluded.title,
    subtitle = excluded.subtitle,
    body = excluded.body,
    page_type = excluded.page_type,
    is_published = excluded.is_published,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    sort_order = excluded.sort_order
  returning id
)
insert into public.page_blocks (
  page_id,
  block_key,
  title,
  content,
  media_url,
  sort_order,
  is_active
)
select
  seeded_page.id,
  block_data.block_key,
  block_data.title,
  block_data.content,
  null,
  block_data.sort_order,
  true
from seeded_page
cross join (
  values
    ('atendimento-direto', 'Atendimento direto', null, 1),
    ('leitura-de-perfil', 'Leitura de perfil', null, 2),
    ('seguranca-documental', 'Segurança documental', null, 3)
) as block_data(block_key, title, content, sort_order)
on conflict (page_id, block_key) do update
set
  title = excluded.title,
  content = excluded.content,
  media_url = excluded.media_url,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

with seeded_page as (
  insert into public.pages (
    slug,
    title,
    subtitle,
    body,
    page_type,
    is_published,
    seo_title,
    seo_description,
    sort_order
  )
  values (
    'servicos',
    'Serviços essenciais para compra, venda e condução do negócio',
    'Uma estrutura simples para orientar o cliente, organizar etapas e dar mais segurança à negociação.',
    $$A assessoria atua de forma prática, com foco em clareza, leitura de cenário e apoio consistente em cada fase do processo. O objetivo é reduzir ruído, alinhar expectativas e manter o negócio andando com direção.

Os serviços podem crescer junto com a operação, mas a base já nasce preparada para atender demandas de compra, venda e análise do negócio com comunicação objetiva.$$,
    'services',
    true,
    'Serviços | Luana Modotte Assessoria Imobiliária',
    'Conheça os serviços iniciais da assessoria imobiliária.',
    20
  )
  on conflict (slug) do update
  set
    title = excluded.title,
    subtitle = excluded.subtitle,
    body = excluded.body,
    page_type = excluded.page_type,
    is_published = excluded.is_published,
    seo_title = excluded.seo_title,
    seo_description = excluded.seo_description,
    sort_order = excluded.sort_order
  returning id
)
insert into public.page_blocks (
  page_id,
  block_key,
  title,
  content,
  media_url,
  sort_order,
  is_active
)
select
  seeded_page.id,
  block_data.block_key,
  block_data.title,
  block_data.content,
  null,
  block_data.sort_order,
  true
from seeded_page
cross join (
  values
    (
      'compra-assistida',
      'Compra assistida',
      'Curadoria inicial, leitura do perfil do cliente, organização de visitas e apoio na tomada de decisão.',
      1
    ),
    (
      'venda-estrategica',
      'Venda estratégica',
      'Posicionamento do imóvel, apresentação mais clara da oferta e condução objetiva das conversas com interessados.',
      2
    ),
    (
      'analise-documental',
      'Análise documental e negociação',
      'Apoio na leitura do negócio, alinhamento entre as partes e maior segurança na etapa de fechamento.',
      3
    )
) as block_data(block_key, title, content, sort_order)
on conflict (page_id, block_key) do update
set
  title = excluded.title,
  content = excluded.content,
  media_url = excluded.media_url,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.pages (
  slug,
  title,
  subtitle,
  body,
  page_type,
  is_published,
  seo_title,
  seo_description,
  sort_order
)
values (
  'contato',
  'Fale com a assessoria e encaminhe sua demanda',
  'Os canais principais ficam centralizados no painel e podem ser atualizados sem alterar o site.',
  $$Se você quer conversar sobre compra, venda, análise do imóvel ou próximos passos do negócio, este é o ponto de contato principal da assessoria.

O formulário e os canais institucionais foram organizados para facilitar o primeiro atendimento e direcionar a conversa com mais clareza.$$,
  'contact',
  true,
  'Contato | Luana Modotte Assessoria Imobiliária',
  'Entre em contato com a assessoria imobiliária.',
  30
)
on conflict (slug) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  body = excluded.body,
  page_type = excluded.page_type,
  is_published = excluded.is_published,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  sort_order = excluded.sort_order;

insert into public.pages (
  slug,
  title,
  subtitle,
  body,
  page_type,
  is_published,
  seo_title,
  seo_description,
  sort_order
)
values (
  'quero-vender',
  'Quero vender com mais organização e direcionamento',
  'Uma entrada simples para proprietários que precisam estruturar a venda com mais clareza.',
  $$A página de captação foi pensada para receber os primeiros contatos de proprietários de forma objetiva. O foco aqui é entender o imóvel, o momento do cliente e a melhor forma de conduzir a venda.

Com o avanço da operação, esse conteúdo pode ser aprofundado pelo painel, sem depender de ajuste técnico no site.$$,
  'seller-lead',
  true,
  'Quero vender | Luana Modotte Assessoria Imobiliária',
  'Envie seu imóvel para análise inicial da assessoria.',
  40
)
on conflict (slug) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  body = excluded.body,
  page_type = excluded.page_type,
  is_published = excluded.is_published,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  sort_order = excluded.sort_order;

insert into public.pages (
  slug,
  title,
  subtitle,
  body,
  page_type,
  is_published,
  seo_title,
  seo_description,
  sort_order
)
values (
  'avaliacao',
  'Avaliação inicial para entender o momento do imóvel',
  'Uma abordagem objetiva para iniciar a leitura de preço, posicionamento e potencial de negócio.',
  $$A avaliação inicial ajuda a organizar expectativa, contexto de mercado e estratégia de condução. É o primeiro passo para entender como apresentar o imóvel com mais consistência.

O formulário desta página já deixa o site preparado para receber essas demandas desde o início da operação.$$,
  'valuation',
  true,
  'Avaliação | Luana Modotte Assessoria Imobiliária',
  'Solicite uma avaliação inicial do imóvel.',
  50
)
on conflict (slug) do update
set
  title = excluded.title,
  subtitle = excluded.subtitle,
  body = excluded.body,
  page_type = excluded.page_type,
  is_published = excluded.is_published,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  sort_order = excluded.sort_order;
