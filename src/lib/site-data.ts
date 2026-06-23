export type PropertyListing = {
  slug: string;
  title: string;
  type: string;
  location: string;
  city: string;
  price: string;
  summary: string;
  size: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  featured?: boolean;
  accent: string;
  highlights: string[];
};

export type ServiceCard = {
  title: string;
  description: string;
  icon: string;
  bullets: string[];
};

export type Neighborhood = {
  slug: string;
  name: string;
  city: string;
  description: string;
  propertyCount: number;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  publishedAt: string;
  summary: string[];
};

export const featuredProperties: PropertyListing[] = [
  {
    slug: "casa-contemporanea-jardim-primavera",
    title: "Casa contemporanea com jardim e varanda gourmet",
    type: "Casa",
    location: "Jardim Primavera",
    city: "Sao Paulo",
    price: "R$ 2.480.000",
    summary:
      "Projeto com linhas limpas, area social integrada e acabamento pensado para quem quer conforto sem abrir mao de representatividade.",
    size: "312 m²",
    bedrooms: 4,
    bathrooms: 5,
    garages: 3,
    featured: true,
    accent: "from-brand-gold/70 via-brand-beige/20 to-brand-navy-deep",
    highlights: ["Piscina", "Home office", "Area gourmet"],
  },
  {
    slug: "apartamento-vista-aberta-vila-nova",
    title: "Apartamento alto padrao com vista aberta",
    type: "Apartamento",
    location: "Vila Nova",
    city: "Sao Paulo",
    price: "R$ 1.680.000",
    summary:
      "Um endereco urbano com planta funcional, varanda ampla e infraestrutura completa para rotina moderna.",
    size: "184 m²",
    bedrooms: 3,
    bathrooms: 4,
    garages: 2,
    accent: "from-brand-navy via-brand-navy-deep to-brand-taupe/50",
    highlights: ["Varanda ampla", "Lazer completo", "Elevador privativo"],
  },
  {
    slug: "terreno-estrategico-parque-central",
    title: "Terreno estrategico para incorporacao",
    type: "Terreno",
    location: "Parque Central",
    city: "Campinas",
    price: "R$ 950.000",
    summary:
      "Opção ideal para incorporadores e investidores que buscam area com potencial de valorizacao e leitura clara de mercado.",
    size: "480 m²",
    bedrooms: 0,
    bathrooms: 0,
    garages: 0,
    accent: "from-brand-taupe via-brand-beige/30 to-brand-navy",
    highlights: ["Zoneamento favoravel", "Acesso rapido", "Documentacao ok"],
  },
  {
    slug: "townhouse-reservas-do-alto",
    title: "Townhouse sofisticada com vista para a reserva",
    type: "Townhouse",
    location: "Reservas do Alto",
    city: "Santo Andre",
    price: "R$ 1.920.000",
    summary:
      "Uma proposta de arquitetura contemporanea, ambientes integrados e atmosfera de casa de revista.",
    size: "228 m²",
    bedrooms: 3,
    bathrooms: 4,
    garages: 2,
    accent: "from-brand-gold/55 via-brand-navy-deep to-brand-ink",
    highlights: ["Suite master", "Jardim interno", "Fechadura digital"],
  },
];

export const services: ServiceCard[] = [
  {
    title: "Curadoria de imoveis",
    description:
      "Selecionamos oportunidades alinhadas ao perfil do cliente e ao posicionamento da marca da assessoria.",
    icon: "compass",
    bullets: ["Filtro tecnico", "Visao comercial", "Leitura de liquidez"],
  },
  {
    title: "Gestao de anuncios premium",
    description:
      "Anuncios com narrativa consistente, fotos organizadas e destaque para os pontos que realmente vendem.",
    icon: "sparkles",
    bullets: ["Copy comercial", "Destaque visual", "SEO do anuncio"],
  },
  {
    title: "Acompanhamento documental",
    description:
      "Do primeiro contato ao fechamento, a assessoria acompanha documentos, prazos e riscos da operacao.",
    icon: "shield-check",
    bullets: ["Checklist", "Conferencia", "Reducao de risco"],
  },
  {
    title: "Estratégia para vendedores",
    description:
      "Posicionamento correto do ativo, precificacao inteligente e previsao de objecoes para acelerar a venda.",
    icon: "chart-column",
    bullets: ["Preco", "Apresentacao", "Conversao"],
  },
];

export const neighborhoods: Neighborhood[] = [
  {
    slug: "jardim-primavera",
    name: "Jardim Primavera",
    city: "Sao Paulo",
    description:
      "Area residencial valorizada, com perfil familiar e forte demanda para casas de alto padrao.",
    propertyCount: 18,
  },
  {
    slug: "vila-nova",
    name: "Vila Nova",
    city: "Sao Paulo",
    description:
      "Regiao urbana com apartamentos premium, servicos proximos e liquidez consistente.",
    propertyCount: 24,
  },
  {
    slug: "parque-central",
    name: "Parque Central",
    city: "Campinas",
    description:
      "Corredor estrategico para investidores que procuram terrenos e projetos com potencial de escala.",
    propertyCount: 12,
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "como-valorizar-um-imovel-antes-de-anunciar",
    title: "Como valorizar um imovel antes de anunciar",
    excerpt:
      "A lista certa de ajustes aumenta a percepcao de valor sem comprometer a margem da operacao.",
    category: "Venda inteligente",
    readingTime: "5 min",
    publishedAt: "2026-06-01",
    summary: [
      "Organizar iluminacao, fotos e pequenos reparos antes da publicacao.",
      "Posicionar o preco com base no bairro e no perfil do comprador.",
      "Construir uma apresentacao que reduza objecoes logo no primeiro contato.",
    ],
  },
  {
    slug: "qual-bairro-faz-mais-sentido-para-familias",
    title: "Qual bairro faz mais sentido para familias em crescimento",
    excerpt:
      "A decisao vai alem do metro quadrado e depende de rotina, acesso e projeção de valorizacao.",
    category: "SEO local",
    readingTime: "6 min",
    publishedAt: "2026-06-06",
    summary: [
      "Analise de mobilidade, escolas e servicos proximos.",
      "Importancia de historico de liquidez e rotatividade do bairro.",
      "Como a assessoria pode apresentar comparativos claros para o cliente.",
    ],
  },
  {
    slug: "o-que-o-vendedor-precisa-antes-de-publicar-o-imovel",
    title: "O que o vendedor precisa antes de publicar o imovel",
    excerpt:
      "Documentacao, fotos, narrativa e estrategia comercial precisam estar alinhadas antes da publicacao.",
    category: "Processo",
    readingTime: "4 min",
    publishedAt: "2026-06-11",
    summary: [
      "Conferir documentos e situacao juridica do ativo.",
      "Definir publico e faixa de preco antes de expor o anuncio.",
      "Preparar fotos, descricoes e chamada para contato.",
    ],
  },
];

export const sellerBenefits = [
  "Precificacao mais precisa para reduzir tempo parado no mercado.",
  "Apresentacao do ativo com narrativa premium e orientada a conversao.",
  "Acompanhamento humano durante documentacao, negociacao e fechamento.",
];

export const sellingSteps = [
  {
    title: "Diagnostico inicial",
    description:
      "Entendemos o ativo, a urgencia do vendedor e o posicionamento ideal para o mercado.",
  },
  {
    title: "Preparacao comercial",
    description:
      "Organizamos imagem, precificacao, fotos e roteiro de contato para melhorar a percepcao de valor.",
  },
  {
    title: "Publicacao e divulgacao",
    description:
      "Disparamos o anuncio nos canais corretos e acompanhamos o retorno com foco em qualidade de lead.",
  },
  {
    title: "Negociacao e fechamento",
    description:
      "Monitoramos propostas, documentos e ajustes finais para manter o negocio seguro ate a assinatura.",
  },
];

export const contactChannels = [
  {
    label: "WhatsApp comercial",
    value: "A configurar no site_settings",
    note: "Canal principal para atendimento rapido.",
  },
  {
    label: "E-mail institucional",
    value: "contato@luanamodotte.com.br",
    note: "Recebe leads do site e encaminhamentos internos.",
  },
  {
    label: "Horario",
    value: "Seg a sex, 9h as 18h",
    note: "Atendimento com foco em previsibilidade e retorno.",
  },
];

export const adminMetrics = [
  {
    label: "Imoveis ativos",
    value: "42",
    description: "Publicados, rascunhos e destaques separados por estado.",
  },
  {
    label: "Leads novos",
    value: "18",
    description: "Capturas recentes vindas do site e de campanhas locais.",
  },
  {
    label: "Conteudos editaveis",
    value: "12",
    description: "Paginas, blocos e banners prontos para atualizacao.",
  },
  {
    label: "Taxa de resposta",
    value: "94%",
    description: "Tempo medio de retorno dentro da janela operacional.",
  },
];

export const recentLeads = [
  {
    name: "Marina Castro",
    channel: "WhatsApp",
    interest: "Casa Jardim Primavera",
    status: "Novo",
    createdAt: "Hoje, 09:15",
  },
  {
    name: "Paulo Mendes",
    channel: "Formulario",
    interest: "Avaliacao de terreno",
    status: "Em atendimento",
    createdAt: "Hoje, 10:40",
  },
  {
    name: "Renata Lima",
    channel: "E-mail",
    interest: "Apartamento Vila Nova",
    status: "Qualificado",
    createdAt: "Ontem, 16:20",
  },
];

export const contentBlocks = [
  {
    name: "Hero da home",
    status: "Publico",
    updatedAt: "Hoje",
  },
  {
    name: "Servicos institucionais",
    status: "Em revisao",
    updatedAt: "Ontem",
  },
  {
    name: "Banner de destaque",
    status: "Agendado",
    updatedAt: "Ontem",
  },
];

export const seoChecklist = [
  "Title e description por pagina configurados",
  "Breadcrumbs e headings coerentes com a busca local",
  "Sitemap e robots prontos para indexacao",
  "Open Graph consistente com a marca",
];

export const teamMembers = [
  {
    name: "Luana Modotte",
    role: "Diretora",
    permission: "Admin",
  },
  {
    name: "Equipe Comercial",
    role: "Atendimento e follow-up",
    permission: "Editor",
  },
  {
    name: "Marketing Local",
    role: "SEO e conteudo",
    permission: "Editor",
  },
];

export function getPropertyBySlug(slug: string) {
  return featuredProperties.find((property) => property.slug === slug);
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getNeighborhoodBySlug(slug: string) {
  return neighborhoods.find((neighborhood) => neighborhood.slug === slug);
}
