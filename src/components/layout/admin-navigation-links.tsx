"use client";

import {
  Building2,
  FileText,
  Inbox,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

type AdminNavigationLinksProps = {
  items: AdminNavigationItem[];
  mobile?: boolean;
};

export function AdminNavigationLinks({
  items,
  mobile = false,
}: AdminNavigationLinksProps) {
  const pathname = usePathname();

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
          <Link
            key={item.href}
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
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
