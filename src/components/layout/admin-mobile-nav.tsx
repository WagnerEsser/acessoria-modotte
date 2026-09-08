"use client";

import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AdminForm } from "@/components/admin/admin-form";
import { AdminNavigationLinks } from "@/components/layout/admin-navigation-links";
import { BrandMark } from "@/components/layout/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import type { AdminNavigationItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AdminMobileNavProps = {
  items: AdminNavigationItem[];
};

export function AdminMobileNav({ items }: AdminMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-brand-beige/12 bg-brand-navy/72 px-4 py-3 shadow-[0_24px_80px_-36px_rgba(11,27,44,0.75)] backdrop-blur-xl">
        <BrandMark compact />
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "size-10 px-0",
          )}
          aria-expanded={open}
          aria-controls="admin-mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          title={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {open ? (
        <nav
          id="admin-mobile-menu"
          className="mt-3 rounded-2xl border border-brand-beige/12 bg-brand-navy/96 p-3 shadow-2xl backdrop-blur-xl"
        >
          <div onClick={() => setOpen(false)}>
            <AdminNavigationLinks items={items} mobile />
          </div>
          <div className="mt-3 space-y-1 border-t border-brand-beige/10 pt-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-brand-ivory/80 transition hover:bg-brand-ivory/6 hover:text-brand-ivory"
            >
              <ExternalLink className="size-4 text-brand-gold/75" aria-hidden="true" />
              <span>Ir para o site</span>
            </a>
            <AdminForm action="/api/auth/sign-out" className="block">
              <SubmitButton
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-xl px-3 py-3 text-brand-ivory/80 hover:text-brand-ivory"
                pendingLabel="Saindo..."
              >
                <LogOut className="size-4 text-brand-gold/75" aria-hidden="true" />
                Sair
              </SubmitButton>
            </AdminForm>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
