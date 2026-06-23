import type { HTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.24em]",
  {
    variants: {
      variant: {
        gold: "border-brand-gold/25 bg-brand-gold/12 text-brand-gold",
        outline: "border-brand-beige/20 bg-transparent text-brand-ivory/80",
        soft: "border-brand-ivory/12 bg-brand-ivory/8 text-brand-ivory/85",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
