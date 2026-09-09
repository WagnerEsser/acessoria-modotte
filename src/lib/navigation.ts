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
  { href: "/quero-vender", label: "Quero vender" },
  { href: "/contato", label: "Contato" },
];

export type PublicNavigationVisibility = {
  showAreasNavigation: boolean;
  showServicesNavigation?: boolean;
  showSellNavigation?: boolean;
  showAboutNavigation?: boolean;
  showPropertiesNavigation?: boolean;
  showContactNavigation?: boolean;
};

export function getVisiblePublicNavigation(
  visibility: PublicNavigationVisibility,
) {
  return publicNavigation.filter((item) => {
    if (item.href === "/areas") {
      return visibility.showAreasNavigation;
    }

    if (item.href === "/servicos") return visibility.showServicesNavigation !== false;
    if (item.href === "/quero-vender") return visibility.showSellNavigation !== false;
    if (item.href === "/sobre") return visibility.showAboutNavigation !== false;
    if (item.href === "/imoveis") return visibility.showPropertiesNavigation !== false;
    if (item.href === "/contato") return visibility.showContactNavigation !== false;

    return true;
  });
}

export const adminNavigation: AdminNavigationItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/admin/imoveis", label: "Imóveis", icon: "building-2" },
  { href: "/admin/leads", label: "Leads", icon: "inbox" },
  { href: "/admin/conteudos", label: "Conteúdos", icon: "file-text" },
  { href: "/admin/usuarios", label: "Usuários", icon: "users" },
];
