"use client";

import {
  Building2,
  ChevronDown,
  FileText,
  Inbox,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { AdminNavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  "building-2": Building2,
  inbox: Inbox,
  "file-text": FileText,
  sparkles: Sparkles,
  users: Users,
} as const;

const contentSections = [
  { id: "conteudos-contato", label: "Contato e marca" },
  { id: "conteudos-sobre", label: "Sobre" },
  { id: "conteudos-servicos", label: "Serviços" },
  { id: "conteudos-quero-vender", label: "Quero vender" },
  { id: "conteudos-contato-pagina", label: "Contato" },
  { id: "conteudos-imoveis", label: "Imóveis" },
  { id: "conteudos-areas", label: "Áreas atendidas" },
] as const;

type AdminNavigationLinksProps = {
  items: AdminNavigationItem[];
  mobile?: boolean;
};

export function AdminNavigationLinks({
  items,
  mobile = false,
}: AdminNavigationLinksProps) {
  const pathname = usePathname();
  const [contentExpanded, setContentExpanded] = useState(
    pathname === "/admin/conteudos" || pathname.startsWith("/admin/conteudos/"),
  );

  useEffect(() => {
    if (pathname === "/admin/conteudos" || pathname.startsWith("/admin/conteudos/")) {
      setContentExpanded(true);
    }
  }, [pathname]);

  return (
    <nav
      className={cn(mobile ? "grid gap-1" : "mt-8 space-y-2")}
      aria-label="Navegação administrativa"
    >
      {items.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");

        return (
          <div key={item.href}>
            {item.href === "/admin/conteudos" ? (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm transition",
                  mobile ? "rounded-xl" : "rounded-2xl border",
                  isActive
                    ? "border-brand-gold/30 bg-brand-gold/10 text-brand-ivory"
                    : "border-transparent text-brand-ivory/80 hover:border-brand-beige/12 hover:bg-brand-ivory/6 hover:text-brand-ivory",
                )}
              >
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-3",
                    mobile ? "rounded-xl px-3 py-3" : "rounded-l-2xl px-4 py-3",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      isActive ? "text-brand-gold" : "text-brand-gold/75",
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
                <button
                  type="button"
                  aria-expanded={contentExpanded}
                  aria-controls="admin-content-subitems"
                  aria-label={contentExpanded ? "Recolher conteúdos" : "Expandir conteúdos"}
                  title={contentExpanded ? "Recolher subitens" : "Expandir subitens"}
                  onClick={(event) => {
                    event.stopPropagation();
                    setContentExpanded((current) => !current);
                  }}
                  className={cn(
                    "inline-flex shrink-0 cursor-pointer items-center justify-center text-brand-gold/75 transition hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70",
                    mobile ? "mr-2 size-9 rounded-lg" : "mr-2 size-9 rounded-xl",
                  )}
                >
                  <ChevronDown
                    className={cn("size-4 transition-transform duration-200", contentExpanded && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
              </div>
            ) : (
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 text-sm transition",
                  mobile
                    ? "rounded-xl px-3 py-3"
                    : "rounded-2xl border px-4 py-3",
                  isActive
                    ? "border-brand-gold/30 bg-brand-gold/10 text-brand-ivory"
                    : "border-transparent text-brand-ivory/80 hover:border-brand-beige/12 hover:bg-brand-ivory/6 hover:text-brand-ivory",
                )}
              >
                <Icon
                  className={cn(
                    "size-4",
                    isActive ? "text-brand-gold" : "text-brand-gold/75",
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1">{item.label}</span>
              </Link>
            )}
            {item.href === "/admin/conteudos" && contentExpanded ? (
              <div id="admin-content-subitems" className={cn("ml-5 border-l border-brand-beige/12 pl-3", mobile ? "mt-1" : "mt-2")}>
                <div className={cn(mobile ? "grid gap-1" : "grid gap-1")}>
                  {contentSections.map((section) => (
                    <Link
                      key={section.id}
                      href={`/admin/conteudos#${section.id}`}
                      className="rounded-lg px-3 py-2 text-xs text-brand-ivory/60 transition hover:bg-brand-ivory/6 hover:text-brand-ivory"
                    >
                      {section.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
