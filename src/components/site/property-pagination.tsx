"use client";

import { useRouter } from "next/navigation";

import { Pagination } from "@/components/shared/pagination";

type PropertyPaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  type?: string;
  city?: string;
  neighborhoodSlug?: string;
  featuredOnly?: boolean;
};

function buildPropertiesHref({ type, city, neighborhoodSlug, featuredOnly, page, pageSize }: PropertyPaginationProps & { page?: number; pageSize?: number }) {
  const params = new URLSearchParams();
  if (type) params.set("tipo", type);
  if (city) params.set("cidade", city);
  if (neighborhoodSlug) params.set("bairro", neighborhoodSlug);
  if (featuredOnly) params.set("destaque", "1");
  if (page && page > 1) params.set("pagina", String(page));
  if (pageSize && pageSize !== 10) params.set("porPagina", String(pageSize));
  const query = params.toString();
  return query ? `/imoveis?${query}` : "/imoveis";
}

export function PropertyPagination(props: PropertyPaginationProps) {
  const router = useRouter();

  return (
    <Pagination
      currentPage={props.currentPage}
      totalItems={props.totalItems}
      pageSize={props.pageSize}
      onPageChange={(page) => router.push(buildPropertiesHref({ ...props, page }))}
      onPageSizeChange={(pageSize) => router.push(buildPropertiesHref({ ...props, page: 1, pageSize }))}
    />
  );
}
