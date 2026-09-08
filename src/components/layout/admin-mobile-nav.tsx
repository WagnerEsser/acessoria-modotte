"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AdminNavigationLinks } from "@/components/layout/admin-navigation-links";
import { BrandMark } from "@/components/layout/brand-mark";
import { buttonVariants } from "@/components/ui/button";
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
        </nav>
      ) : null}
    </div>
  );
}
