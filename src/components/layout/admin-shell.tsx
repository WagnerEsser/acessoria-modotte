import { Building2, FileText, Inbox, LayoutDashboard, LogOut, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { adminNavigation } from "@/lib/navigation";

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  "building-2": Building2,
  inbox: Inbox,
  "file-text": FileText,
  sparkles: Sparkles,
  users: Users,
} as const;

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(203,178,140,0.12),_transparent_32%),linear-gradient(180deg,_#07111d_0%,_#0b1b2c_100%)] text-brand-ivory">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="rounded-[1.8rem] border border-brand-beige/12 bg-brand-navy/72 p-5 shadow-[0_24px_80px_-36px_rgba(11,27,44,0.75)] backdrop-blur-xl">
          <div className="space-y-5">
            <BrandMark compact />
            <Badge variant="soft" className="w-fit">
              Painel administrativo
            </Badge>
          </div>

          <nav className="mt-8 space-y-2">
            {adminNavigation.map((item) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-brand-ivory/80 transition hover:border-brand-beige/12 hover:bg-brand-ivory/6 hover:text-brand-ivory"
                >
                  <Icon className="size-4 text-brand-gold" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="rounded-[1.8rem] border border-brand-beige/12 bg-brand-navy/52 p-5 shadow-[0_24px_80px_-36px_rgba(11,27,44,0.62)] backdrop-blur-xl sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-brand-beige/10 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-brand-beige/55">
                Luana Modotte
              </p>
              <h1 className="font-display text-2xl font-semibold text-brand-ivory">
                Operacao central da assessoria
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="gold">Ambiente protegido</Badge>
              <form action="/api/auth/sign-out" method="post">
                <Button type="submit" variant="outline" size="sm">
                  Sair
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
