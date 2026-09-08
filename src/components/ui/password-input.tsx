"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function PasswordInput({
  className,
  toggleClassName,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  toggleClassName?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        className={cn("pr-12", className)}
        type={isVisible ? "text" : "password"}
        {...props}
      />
      <button
        type="button"
        aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={isVisible}
        className={cn(
          "absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-brand-navy/65 transition hover:bg-brand-navy/8 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70",
          toggleClassName,
        )}
        onClick={() => setIsVisible((current) => !current)}
      >
        <Icon className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
