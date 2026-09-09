import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  actionPosition?: "start" | "end";
  className?: string;
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  actionPosition = "end",
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        actionPosition === "start" && "sm:items-start sm:justify-start sm:gap-8",
        className,
      )}
    >
      {action && actionPosition === "start" ? <div className="order-2 sm:order-1 sm:pt-12">{action}</div> : null}
      <div className={cn("max-w-3xl", actionPosition === "start" && "order-1 sm:order-2")}>
        {eyebrow ? (
          <p className="mb-3 text-xs uppercase tracking-[0.32em] text-brand-beige/60">
            {eyebrow}
          </p>
        ) : null}
        <Heading className="font-display text-3xl font-semibold leading-tight text-brand-ivory sm:text-4xl">
          {title}
        </Heading>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-ivory/70 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action && actionPosition === "end" ? <div>{action}</div> : null}
    </div>
  );
}
