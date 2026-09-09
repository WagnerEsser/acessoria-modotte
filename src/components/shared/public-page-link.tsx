import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

import { getPublicPageBySlug } from "@/lib/public-content";

type PublicPageLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  children: ReactNode;
};

const managedPageRoutes = [
  ["/sobre", "sobre"],
  ["/servicos", "servicos"],
  ["/quero-vender", "quero-vender"],
  ["/contato", "contato"],
  ["/imoveis", "imoveis"],
  ["/areas", "areas"],
  ["/avaliacao", "avaliacao"],
] as const;

function getManagedPageSlug(href: string) {
  const route = managedPageRoutes.find(([prefix]) => href === prefix || href.startsWith(`${prefix}/`));
  return route?.[1] ?? null;
}

export async function PublicPageLink({ href, children, ...props }: PublicPageLinkProps) {
  const slug = getManagedPageSlug(href);

  if (slug && !(await getPublicPageBySlug(slug))) {
    return null;
  }

  return <Link href={href} {...props}>{children}</Link>;
}
