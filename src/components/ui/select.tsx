"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type SelectProps = {
  name: string;
  label: ReactNode;
  options: SelectOption[];
  placeholder?: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  menuClassName?: string;
};

function isPrintableKey(key: string) {
  return key.length === 1 && !/\s/.test(key);
}

export function Select({
  name,
  label,
  options,
  placeholder = "Selecione uma opção",
  defaultValue = "",
  value,
  onValueChange,
  disabled = false,
  required = false,
  className,
  menuClassName,
}: SelectProps) {
  const labelId = useId();
  const valueId = useId();
  const listboxId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedValue = isControlled ? value ?? "" : internalValue;
  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue) ?? null,
    [options, selectedValue]
  );

  const selectionLabel = selectedOption?.label ?? placeholder;
  const helperTextId = `${labelId}-helper`;

  function setSelectedValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  function closeMenu() {
    setOpen(false);
  }

  function openMenu(nextIndex?: number) {
    if (disabled || !options.length) {
      return;
    }

    setOpen(true);
    setActiveIndex(
      typeof nextIndex === "number"
        ? nextIndex
        : Math.max(0, options.findIndex((option) => option.value === selectedValue))
    );
  }

  function selectOption(index: number) {
    const option = options[index];

    if (!option || option.disabled) {
      return;
    }

    setSelectedValue(option.value);
    closeMenu();
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (rootRef.current && !rootRef.current.contains(target)) {
        closeMenu();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const selectedIndex = options.findIndex((option) => option.value === selectedValue);
    const nextActiveIndex = selectedIndex >= 0 ? selectedIndex : 0;

    setActiveIndex(nextActiveIndex);
  }, [open, options, selectedValue]);

  useEffect(() => {
    if (!open) {
      return;
    }

    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function handleButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled || !options.length) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Enter":
      case " ": {
        event.preventDefault();

        if (!open) {
          if (event.key === "ArrowUp") {
            openMenu(Math.max(0, options.length - 1));
          } else {
            openMenu();
          }

          return;
        }

        if (event.key === "ArrowDown") {
          setActiveIndex((current) => (current + 1) % options.length);
          return;
        }

        if (event.key === "ArrowUp") {
          setActiveIndex((current) => (current - 1 + options.length) % options.length);
          return;
        }

        selectOption(activeIndex);
        return;
      }
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        return;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(Math.max(0, options.length - 1));
        }
        return;
      default:
        if (!open && isPrintableKey(event.key)) {
          openMenu();
        }
    }
  }

  function handleBlurCapture(event: React.FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget as Node | null;

    if (!nextTarget || !rootRef.current?.contains(nextTarget)) {
      closeMenu();
    }
  }

  return (
    <div ref={rootRef} className={cn("relative w-full space-y-2", className)} onBlurCapture={handleBlurCapture}>
      <span id={labelId} className="text-xs uppercase tracking-[0.24em] text-brand-beige/55">
        {label}
      </span>

      <span id={valueId} className="sr-only">
        {selectedOption?.label ?? placeholder}
      </span>

      <input type="hidden" name={name} value={selectedValue} required={required} />

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-labelledby={`${labelId} ${valueId}`}
        aria-describedby={selectedOption ? undefined : helperTextId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-4 rounded-2xl border border-brand-beige/18 bg-[linear-gradient(180deg,rgba(19,37,59,0.72),rgba(11,27,44,0.94))] px-4 text-left text-sm text-brand-ivory shadow-sm outline-none transition duration-200 hover:border-brand-gold/35 hover:bg-brand-navy/70 focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-brand-gold/45 bg-brand-navy/78 shadow-[0_18px_50px_-20px_rgba(203,178,140,0.28)]"
        )}
      >
        <span className={cn("truncate", selectedOption ? "text-brand-ivory" : "text-brand-ivory/48")}>
          {selectionLabel}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-brand-ivory/72 transition-transform duration-200",
            open && "rotate-180 text-brand-gold"
          )}
        />
      </button>

      {!selectedOption ? (
        <p id={helperTextId} className="text-xs leading-5 text-brand-ivory/50">
          {placeholder}
        </p>
      ) : null}

      <div
        id={listboxId}
        role="listbox"
        aria-labelledby={labelId}
        className={cn(
          "absolute left-0 right-0 top-[calc(100%+0.55rem)] z-30 overflow-hidden rounded-[1.6rem] border border-brand-beige/12 bg-brand-ink/98 shadow-[0_32px_90px_-24px_rgba(0,0,0,0.72)] backdrop-blur-xl transition duration-150",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
          menuClassName
        )}
      >
        <div className="max-h-72 overflow-auto p-2">
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue;
            const isActive = index === activeIndex;

            return (
              <button
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                disabled={option.disabled}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition duration-150",
                  isSelected
                    ? "border-brand-gold/30 bg-brand-gold/10 text-brand-ivory"
                    : "border-transparent bg-transparent text-brand-ivory/78 hover:border-brand-beige/10 hover:bg-brand-ivory/6",
                  isActive && "ring-1 ring-brand-gold/35",
                  option.disabled && "cursor-not-allowed opacity-40"
                )}
              >
                <span className="space-y-1">
                  <span className="block text-sm font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="block text-xs leading-5 text-brand-ivory/58">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                {isSelected ? <Check className="mt-0.5 size-4 shrink-0 text-brand-gold" /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
