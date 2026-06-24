import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({
  label,
  value,
  description,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("h-full p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
            {label}
          </p>
          <div className="mt-2 font-numeric text-3xl font-semibold text-brand-ivory">
            {value}
          </div>
        </div>
        {icon ? (
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-brand-gold/16 bg-brand-gold/12 text-brand-gold">
            {icon}
          </div>
        ) : null}
      </div>
      {description ? (
        <p className="mt-4 text-sm leading-6 text-brand-ivory/68">{description}</p>
      ) : null}
    </Card>
  );
}
