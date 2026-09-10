"use client";

import { useState, type ChangeEvent, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";

type MaskType = "currency-brl" | "cep" | "phone";

type MaskedInputProps = Omit<
  ComponentProps<typeof Input>,
  "defaultValue" | "onChange" | "value"
> & {
  defaultValue?: string;
  mask: MaskType;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function parseInitialNumber(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const compact = normalized.replace(/\s/g, "");
  const decimalNormalized =
    compact.includes(",") && compact.includes(".")
      ? compact.replace(/\./g, "").replace(",", ".")
      : compact.replace(",", ".");
  const parsed = Number(decimalNormalized.replace(/[^\d.-]/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
}

function getInitialCurrencyDigits(value: string) {
  const initialNumber = parseInitialNumber(value);

  if (initialNumber === null) {
    return "";
  }

  return String(Math.round(initialNumber));
}

function formatCurrencyInput(value: string) {
  const initialNumber = parseInitialNumber(value);

  if (initialNumber === null) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(initialNumber).replace(/\u00A0/g, " ");
}

function formatCurrencyDigits(digits: string) {
  const normalizedDigits = digits.replace(/^0+(?=\d)/, "").slice(0, 15);

  if (!normalizedDigits) {
    return "";
  }

  return formatCurrencyInput(normalizedDigits);
}

function formatCepInput(value: string) {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatPhoneInput(value: string) {
  let digits = onlyDigits(value);

  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 11);

  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  const subscriberLength = digits.length > 10 ? 5 : 4;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 2 + subscriberLength)}-${digits.slice(2 + subscriberLength)}`;
}

function formatMaskedValue(mask: MaskType, value: string) {
  if (mask === "currency-brl") {
    return formatCurrencyInput(value);
  }

  if (mask === "cep") {
    return formatCepInput(value);
  }

  return formatPhoneInput(value);
}

function formatTypedValue(mask: Exclude<MaskType, "currency-brl">, value: string) {
  if (mask === "cep") {
    return formatCepInput(value);
  }

  return formatPhoneInput(value);
}

export function MaskedInput({
  defaultValue = "",
  mask,
  ...props
}: MaskedInputProps) {
  const [currencyDigits, setCurrencyDigits] = useState(() =>
    mask === "currency-brl" ? getInitialCurrencyDigits(defaultValue) : "",
  );
  const [value, setValue] = useState(() => formatMaskedValue(mask, defaultValue));

  function handleCurrencyChange(event: ChangeEvent<HTMLInputElement>) {
    const nativeEvent = event.nativeEvent as InputEvent;

    setCurrencyDigits((currentDigits) => {
      if (nativeEvent.inputType?.startsWith("delete")) {
        return currentDigits.slice(0, -1);
      }

      if (nativeEvent.data) {
        return `${currentDigits}${onlyDigits(nativeEvent.data)}`.slice(0, 15);
      }

      return onlyDigits(event.currentTarget.value).slice(0, 15);
    });
  }

  if (mask === "currency-brl") {
    return (
      <Input
        {...props}
        value={formatCurrencyDigits(currencyDigits)}
        onChange={handleCurrencyChange}
      />
    );
  }

  return (
    <Input
      {...props}
      value={value}
      onChange={(event) => setValue(formatTypedValue(mask, event.target.value))}
    />
  );
}
