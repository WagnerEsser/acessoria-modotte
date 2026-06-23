const DEFAULT_WHATSAPP_NUMBER = "5511999999999";

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function getWhatsAppNumber() {
  return normalizeDigits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER);
}

export function getWhatsAppHref(message = "Olá, gostaria de falar com a assessoria.") {
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
}
