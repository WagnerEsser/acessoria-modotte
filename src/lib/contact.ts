export function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatBrazilianPhoneDisplayNumber(number: string) {
  const digits = normalizePhoneDigits(number);
  const nationalDigits = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;

  if (digits.startsWith("55") && digits.length === 13) {
    return `+55 ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }

  if (nationalDigits.length === 11) {
    return `+55 ${nationalDigits.slice(0, 2)} ${nationalDigits.slice(2, 7)}-${nationalDigits.slice(7)}`;
  }

  if (nationalDigits.length === 10) {
    return `+55 ${nationalDigits.slice(0, 2)} ${nationalDigits.slice(2, 6)}-${nationalDigits.slice(6)}`;
  }

  return number;
}

export function getWhatsAppDisplayNumber(number: string) {
  return formatBrazilianPhoneDisplayNumber(number);
}

export function getWhatsAppHref(
  message = "Olá, gostaria de falar com a assessoria.",
  number: string
) {
  return `https://wa.me/${normalizePhoneDigits(number)}?text=${encodeURIComponent(message)}`;
}
