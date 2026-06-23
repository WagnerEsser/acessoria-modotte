import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[160px] w-full rounded-2xl border border-brand-beige/18 bg-brand-navy/55 px-4 py-3 text-sm text-brand-ivory placeholder:text-brand-ivory/42 shadow-sm outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20",
        className
      )}
      {...props}
    />
  );
}
