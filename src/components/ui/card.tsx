import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-brand-beige/15 bg-brand-navy/55 p-6 shadow-[0_24px_80px_-36px_rgba(11,27,44,0.85)] backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
