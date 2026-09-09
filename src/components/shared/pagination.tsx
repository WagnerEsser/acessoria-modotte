"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
};

function getPageItems(currentPage: number, totalPages: number): Array<number | "ellipsis-start" | "ellipsis-end"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis-start", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages];
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageItems = getPageItems(Math.min(currentPage, totalPages), totalPages);

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
      <label className="flex items-center gap-2 text-xs text-brand-ivory/58">
        <span>Itens por página</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-9 cursor-pointer rounded-xl border border-brand-beige/18 bg-brand-navy px-2 text-sm text-brand-ivory outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20"
          aria-label="Itens por página"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>

      {totalPages > 1 ? (
        <nav className="flex items-center gap-1" aria-label="Paginação">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-brand-ivory/62 transition hover:bg-brand-ivory/8 hover:text-brand-ivory disabled:pointer-events-none disabled:opacity-30"
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </button>

          {pageItems.map((item) => {
            if (typeof item !== "number") {
              return (
                <span key={item} className="inline-flex size-9 items-center justify-center text-xs text-brand-ivory/62" aria-hidden="true">
                  ...
                </span>
              );
            }

            const isCurrent = item === currentPage;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Página ${item}`}
                className={cn(
                  "inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-xs font-medium transition",
                  isCurrent
                    ? "bg-brand-ivory/18 text-brand-ivory"
                    : "text-brand-ivory hover:bg-brand-ivory/8",
                )}
              >
                {item}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-brand-ivory/62 transition hover:bg-brand-ivory/8 hover:text-brand-ivory disabled:pointer-events-none disabled:opacity-30"
            aria-label="Próxima página"
          >
            <ChevronRight className="size-4" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
