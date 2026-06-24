function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatWhatsAppDisplayNumber(number: string) {
  const digits = normalizeDigits(number);

  if (digits.length >= 12 && digits.startsWith("55")) {
    return `55 ${digits.slice(2, 4)} ${digits.slice(4)}`;
  }

  return number;
}

export function getWhatsAppDisplayNumber(number: string) {
  return formatWhatsAppDisplayNumber(number);
}

export function getWhatsAppHref(
  message = "Olá, gostaria de falar com a assessoria.",
  number: string
) {
  return `https://wa.me/${normalizeDigits(number)}?text=${encodeURIComponent(message)}`;
}
