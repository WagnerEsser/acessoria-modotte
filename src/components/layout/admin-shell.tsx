import { LogOut, UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import type { ReactNode } from "react";

import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { AdminNavigationLinks } from "@/components/layout/admin-navigation-links";
import { AdminForm } from "@/components/admin/admin-form";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/layout/brand-mark";
import { SubmitButton } from "@/components/ui/submit-button";
import type { AdminIdentity } from "@/lib/admin-identity";
import { adminNavigation } from "@/lib/navigation";

const roleLabelByRole = {
  admin: "Administrador",
  editor: "Editor",
  superadmin: "Superadmin",
} as const;

type AdminShellProps = {
  children: ReactNode;
  currentUser: AdminIdentity;
};

export function AdminShell({ children, currentUser }: AdminShellProps) {
  const visibleNavigation = adminNavigation.filter((item) =>
    currentUser.role === "superadmin" ||
    !["/admin/conteudos", "/admin/usuarios"].includes(item.href),
  );
  const roleLabel = currentUser.role
    ? roleLabelByRole[currentUser.role]
    : "Papel não informado";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(203,178,140,0.12),_transparent_32%),linear-gradient(180deg,_#07111d_0%,_#0b1b2c_100%)] text-brand-ivory">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <AdminMobileNav items={visibleNavigation} />

        <aside className="hidden rounded-[1.8rem] border border-brand-beige/12 bg-brand-navy/72 p-5 shadow-[0_24px_80px_-36px_rgba(11,27,44,0.75)] backdrop-blur-xl lg:block">
          <div className="space-y-5">
            <BrandMark compact />
            <Badge variant="soft" className="w-fit">
              Painel administrativo
            </Badge>
          </div>

          <AdminNavigationLinks items={visibleNavigation} />
        </aside>

        <main className="rounded-[1.8rem] border border-brand-beige/12 bg-brand-navy/52 p-5 shadow-[0_24px_80px_-36px_rgba(11,27,44,0.62)] backdrop-blur-xl sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-brand-beige/10 pb-5">
            <div className="flex min-w-0 items-center gap-3">
              <UserRound className="size-5 shrink-0 text-brand-gold" aria-hidden="true" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate text-base font-medium text-brand-ivory">
                    {currentUser.name}
                  </p>
                  <Badge
                    variant="gold"
                    className="shrink-0 normal-case tracking-normal"
                  >
                    {roleLabel}
                  </Badge>
                </div>
                <p className="truncate text-sm text-brand-ivory/58">
                  {currentUser.email}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Ir para o site
                <span aria-hidden="true">↗</span>
              </Link>
              <AdminForm action="/api/auth/sign-out">
                <SubmitButton
                  variant="outline"
                  size="sm"
                  pendingLabel="Saindo..."
                >
                  Sair
                  <LogOut className="size-4" />
                </SubmitButton>
              </AdminForm>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
