import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-brand-gold/25 bg-brand-gold text-brand-navy shadow-lg shadow-brand-navy/25">
        <span className="font-display text-xl font-bold leading-none">LM</span>
      </div>
      <div className="leading-tight">
        <div
          className={cn(
            "font-display text-lg font-semibold tracking-[0.02em] text-brand-ivory",
            compact && "text-base"
          )}
        >
          {brand.name}
        </div>
        <div className="text-[0.68rem] uppercase tracking-[0.28em] text-brand-beige/70">
          {brand.subtitle}
        </div>
      </div>
    </div>
  );
}
