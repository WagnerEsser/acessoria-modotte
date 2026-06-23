const DEFAULT_WHATSAPP_NUMBER = "5547992826721";
const DEFAULT_WHATSAPP_DISPLAY_NUMBER = "55 47 992826721";

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function getWhatsAppNumber() {
  return normalizeDigits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER);
}

export function getWhatsAppDisplayNumber() {
  return DEFAULT_WHATSAPP_DISPLAY_NUMBER;
}

export function getWhatsAppHref(message = "Olá, gostaria de falar com a assessoria.") {
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
}
