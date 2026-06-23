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
    title: "Casa contemporânea com jardim e varanda gourmet",
    type: "Casa",
    location: "Jardim Primavera",
    city: "São Paulo",
    price: "R$ 2.480.000",
    summary:
      "Projeto com linhas limpas, área social integrada e acabamento pensado para quem quer conforto sem abrir mão de representatividade.",
    size: "312 m²",
    bedrooms: 4,
    bathrooms: 5,
    garages: 3,
    featured: true,
    accent: "from-brand-gold/70 via-brand-beige/20 to-brand-navy-deep",
    highlights: ["Piscina", "Home office", "Área gourmet"],
  },
  {
    slug: "apartamento-vista-aberta-vila-nova",
    title: "Apartamento alto padrão com vista aberta",
    type: "Apartamento",
    location: "Vila Nova",
    city: "São Paulo",
    price: "R$ 1.680.000",
    summary:
      "Um endereço urbano com planta funcional, varanda ampla e infraestrutura completa para a rotina moderna.",
    size: "184 m²",
    bedrooms: 3,
    bathrooms: 4,
    garages: 2,
    accent: "from-brand-navy via-brand-navy-deep to-brand-taupe/50",
    highlights: ["Varanda ampla", "Lazer completo", "Elevador privativo"],
  },
  {
    slug: "terreno-estrategico-parque-central",
    title: "Terreno estratégico para incorporação",
    type: "Terreno",
    location: "Parque Central",
    city: "Campinas",
    price: "R$ 950.000",
    summary:
      "Opção ideal para incorporadores e investidores que buscam área com potencial de valorização e leitura clara de mercado.",
    size: "480 m²",
    bedrooms: 0,
    bathrooms: 0,
    garages: 0,
    accent: "from-brand-taupe via-brand-beige/30 to-brand-navy",
    highlights: ["Zoneamento favorável", "Acesso rápido", "Documentação ok"],
  },
  {
    slug: "townhouse-reservas-do-alto",
    title: "Townhouse sofisticada com vista para a reserva",
    type: "Townhouse",
    location: "Reservas do Alto",
    city: "Santo André",
    price: "R$ 1.920.000",
    summary:
      "Uma proposta de arquitetura contemporânea, ambientes integrados e atmosfera de casa de revista.",
    size: "228 m²",
    bedrooms: 3,
    bathrooms: 4,
    garages: 2,
    accent: "from-brand-gold/55 via-brand-navy-deep to-brand-ink",
    highlights: ["Suíte master", "Jardim interno", "Fechadura digital"],
  },
];

export const services: ServiceCard[] = [
  {
    title: "Curadoria de imóveis",
    description: "Seleção enxuta dos ativos mais aderentes ao perfil do cliente.",
    icon: "compass",
    bullets: ["Filtro simples", "Leitura comercial"],
  },
  {
    title: "Anúncios premium",
    description: "Texto, imagem e apresentação alinhados para reforçar valor.",
    icon: "sparkles",
    bullets: ["Copy curta", "Imagem limpa"],
  },
  {
    title: "Documentação e fechamento",
    description: "Acompanhamento do processo até a assinatura final.",
    icon: "shield-check",
    bullets: ["Checklist", "Menos risco"],
  },
];

export const neighborhoods: Neighborhood[] = [
  {
    slug: "jardim-primavera",
    name: "Jardim Primavera",
    city: "São Paulo",
    description:
      "Área residencial valorizada, com perfil familiar e forte demanda para casas de alto padrão.",
    propertyCount: 18,
  },
  {
    slug: "vila-nova",
    name: "Vila Nova",
    city: "São Paulo",
    description:
      "Região urbana com apartamentos premium, serviços próximos e liquidez consistente.",
    propertyCount: 24,
  },
  {
    slug: "parque-central",
    name: "Parque Central",
    city: "Campinas",
    description:
      "Corredor estratégico para investidores que procuram terrenos e projetos com potencial de escala.",
    propertyCount: 12,
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "como-valorizar-um-imovel-antes-de-anunciar",
    title: "Como valorizar um imóvel antes de anunciar",
    excerpt:
      "A lista certa de ajustes aumenta a percepção de valor sem comprometer a margem da operação.",
    category: "Venda inteligente",
    readingTime: "5 min",
    publishedAt: "2026-06-01",
    summary: [
      "Organizar iluminação, fotos e pequenos reparos antes da publicação.",
      "Posicionar o preço com base no bairro e no perfil do comprador.",
      "Construir uma apresentação que reduza objeções logo no primeiro contato.",
    ],
  },
  {
    slug: "qual-bairro-faz-mais-sentido-para-familias",
    title: "Qual bairro faz mais sentido para famílias em crescimento",
    excerpt:
      "A decisão vai além do metro quadrado e depende de rotina, acesso e projeção de valorização.",
    category: "SEO local",
    readingTime: "6 min",
    publishedAt: "2026-06-06",
    summary: [
      "Análise de mobilidade, escolas e serviços próximos.",
      "Importância de histórico de liquidez e rotatividade do bairro.",
      "Como a assessoria pode apresentar comparativos claros para o cliente.",
    ],
  },
  {
    slug: "o-que-o-vendedor-precisa-antes-de-publicar-o-imovel",
    title: "O que o vendedor precisa antes de publicar o imóvel",
    excerpt:
      "Documentação, fotos, narrativa e estratégia comercial precisam estar alinhadas antes da publicação.",
    category: "Processo",
    readingTime: "4 min",
    publishedAt: "2026-06-11",
    summary: [
      "Conferir documentos e situação jurídica do ativo.",
      "Definir público e faixa de preço antes de expor o anúncio.",
      "Preparar fotos, descrições e chamada para contato.",
    ],
  },
];

export const sellerBenefits = [
  "Leitura mais clara do ativo e do preço.",
  "Acompanhamento humano até o fechamento.",
];

export const sellingSteps = [
  {
    title: "Diagnóstico",
    description: "Entendemos o ativo e o momento de venda.",
  },
  {
    title: "Preparação",
    description: "Ajustamos fotos, preço e texto do anúncio.",
  },
  {
    title: "Divulgação e negociação",
    description: "Divulgamos, recebemos contatos e seguimos até a proposta final.",
  },
];

export const contactChannels = [
  {
    label: "WhatsApp comercial",
    value: "55 47 992826721",
    note: "Canal principal para atendimento rápido.",
  },
  {
    label: "E-mail institucional",
    value: "contato@luanamodotte.com.br",
    note: "Recebe leads do site e encaminhamentos internos.",
  },
  {
    label: "Horário",
    value: "Seg. a sex., 9h às 18h",
    note: "Atendimento com foco em previsibilidade e retorno.",
  },
];

export const adminMetrics = [
  {
    label: "Imóveis ativos",
    value: "42",
    description: "Publicados, rascunhos e destaques separados por estado.",
  },
  {
    label: "Leads novos",
    value: "18",
    description: "Capturas recentes vindas do site e de campanhas locais.",
  },
  {
    label: "Conteúdos editáveis",
    value: "12",
    description: "Páginas, blocos e banners prontos para atualização.",
  },
  {
    label: "Taxa de resposta",
    value: "94%",
    description: "Tempo médio de retorno dentro da janela operacional.",
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
    channel: "Formulário",
    interest: "Avaliação de terreno",
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
    status: "Público",
    updatedAt: "Hoje",
  },
  {
    name: "Serviços institucionais",
    status: "Em revisão",
    updatedAt: "Ontem",
  },
  {
    name: "Banner de destaque",
    status: "Agendado",
    updatedAt: "Ontem",
  },
];

export const seoChecklist = [
  "Title e description por página configurados",
  "Breadcrumbs e headings coerentes com a busca local",
  "Sitemap e robots prontos para indexação",
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
    role: "SEO e conteúdo",
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
