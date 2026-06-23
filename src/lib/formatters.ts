const brlFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  maximumFractionDigits: 0,
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatCurrencyBRL(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Sob consulta";
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return "Sob consulta";
  }

  return brlFormatter.format(numericValue);
}

export function formatDateBRL(value: string | Date | null | undefined): string {
  if (!value) {
    return "Sem data";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sem data";
  }

  return dateFormatter.format(date);
}

export function formatDateTimeBRL(value: string | Date | null | undefined): string {
  if (!value) {
    return "Sem data";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sem data";
  }

  return dateTimeFormatter.format(date);
}
