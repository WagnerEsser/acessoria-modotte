"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircleMore } from "lucide-react";

import { getWhatsAppHref } from "@/lib/contact";

type WhatsAppBubbleProps = {
  whatsappNumber?: string | null;
};

export function WhatsAppBubble({ whatsappNumber }: WhatsAppBubbleProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("whatsapp-bubble-dismissed");

    if (dismissed === "1") {
      setIsVisible(false);
    }
  }, []);

  function handleDismiss() {
    window.localStorage.setItem("whatsapp-bubble-dismissed", "1");
    setIsVisible(false);
  }

  if (!isVisible || !whatsappNumber) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-6 sm:right-6">
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fechar balão do WhatsApp"
        className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border border-brand-beige/25 bg-brand-ink text-brand-ivory/70 shadow-lg shadow-black/25 transition hover:border-brand-gold/40 hover:text-brand-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ink"
      >
        <span aria-hidden="true">×</span>
      </button>

      <Link
        href={getWhatsAppHref("Olá, gostaria de falar com a assessoria.", whatsappNumber)}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com a assessoria no WhatsApp"
        className="inline-flex items-center gap-3 rounded-full border border-brand-gold/30 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/25 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ink"
      >
        <span className="grid size-8 place-items-center rounded-full bg-white/15">
          <MessageCircleMore className="size-4" />
        </span>
        <span className="hidden sm:inline">WhatsApp</span>
      </Link>
    </div>
  );
}
