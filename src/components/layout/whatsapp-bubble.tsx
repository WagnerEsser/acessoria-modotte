import Link from "next/link";
import { MessageCircleMore } from "lucide-react";

import { getWhatsAppHref } from "@/lib/contact";

export function WhatsAppBubble() {
  return (
    <Link
      href={getWhatsAppHref()}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar com a assessoria no WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full border border-brand-gold/30 bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/25 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ink sm:bottom-6 sm:right-6"
    >
      <span className="grid size-8 place-items-center rounded-full bg-white/15">
        <MessageCircleMore className="size-4" />
      </span>
      <span className="hidden sm:inline">WhatsApp</span>
    </Link>
  );
}
