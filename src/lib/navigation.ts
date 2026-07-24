export type NavigationItem = {
  href: string;
  label: string;
};

export type AdminNavigationItem = NavigationItem & {
  icon: string;
};

export const publicNavigation: NavigationItem[] = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/areas", label: "Áreas atendidas" },
  { href: "/sobre", label: "Sobre" },
  { href: "/servicos", label: "Serviços" },
  { href: "/blog", label: "Blog" },
  { href: "/quero-vender", label: "Quero vender" },
  { href: "/contato", label: "Contato" },
];

export type PublicNavigationVisibility = {
  showBlogNavigation: boolean;
  showAreasNavigation: boolean;
};

export function getVisiblePublicNavigation(
  visibility: PublicNavigationVisibility,
) {
  return publicNavigation.filter((item) => {
    if (item.href === "/blog") {
      return visibility.showBlogNavigation;
    }

    if (item.href === "/areas") {
      return visibility.showAreasNavigation;
    }

    return true;
  });
}

export const adminNavigation: AdminNavigationItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/admin/imoveis", label: "Imóveis", icon: "building-2" },
  { href: "/admin/leads", label: "Leads", icon: "inbox" },
  { href: "/admin/conteudos", label: "Conteúdos", icon: "file-text" },
  { href: "/admin/seo", label: "SEO", icon: "sparkles" },
  { href: "/admin/usuarios", label: "Usuários", icon: "users" },
];
