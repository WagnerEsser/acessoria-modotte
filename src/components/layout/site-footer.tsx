import Link from "next/link";
import { Clock3, LockKeyhole, Mail, MapPin, Phone } from "lucide-react";
import { siInstagram, siWhatsapp, type SimpleIcon } from "simple-icons";

import { BrandMark } from "@/components/layout/brand-mark";
import { getPublicContactChannels, type PublicSiteSettings } from "@/lib/public-content";
import { brand } from "@/lib/brand";
import { publicNavigation } from "@/lib/navigation";

type SiteFooterProps = {
  siteSettings: PublicSiteSettings;
};

function BrandIcon({ icon }: { icon: SimpleIcon }) {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      role="img"
      viewBox="0 0 24 24"
      style={{ color: `#${icon.hex}` }}
    >
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}

function renderContactIcon(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("whatsapp")) {
    return <BrandIcon icon={siWhatsapp} />;
  }

  if (normalized.includes("telefone")) {
    return <Phone className="size-4" aria-hidden="true" />;
  }

  if (normalized.includes("e-mail")) {
    return <Mail className="size-4" aria-hidden="true" />;
  }

  if (normalized.includes("instagram")) {
    return <BrandIcon icon={siInstagram} />;
  }

  if (normalized.includes("endereço")) {
    return <MapPin className="size-4" aria-hidden="true" />;
  }

  if (normalized.includes("horário")) {
    return <Clock3 className="size-4" aria-hidden="true" />;
  }

  return <Phone className="size-4" aria-hidden="true" />;
}

export function SiteFooter({ siteSettings }: SiteFooterProps) {
  const contactChannels = getPublicContactChannels(siteSettings).slice(0, 4);
  const impactPhraseParts = siteSettings.impactPhrase.split(/\.\s+/, 2);

  return (
    <footer className="border-t border-brand-beige/10 bg-brand-ink/96">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr] lg:px-8">
        <div className="space-y-5">
          <BrandMark compact />
          <div className="relative max-w-md overflow-hidden rounded-[2rem] border border-brand-beige/14 bg-[linear-gradient(135deg,rgba(203,178,140,0.16),rgba(11,27,44,0.94))] p-5 shadow-[0_20px_60px_-34px_rgba(0,0,0,0.72)]">
            <div className="absolute -right-8 -top-8 size-24 rounded-full bg-brand-gold/12 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_55%)]" />
            <p className="relative text-base font-medium leading-7 text-brand-ivory/92 sm:text-lg">
              {impactPhraseParts.length === 2 ? (
                <>
                  {impactPhraseParts[0]}.
                  <br />
                  {impactPhraseParts[1]}
                </>
              ) : (
                siteSettings.impactPhrase
              )}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
            Navegação
          </div>
          <ul className="space-y-3 text-sm text-brand-ivory/72">
            {publicNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-brand-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
            Contato
          </div>
          <div className="space-y-3 text-sm text-brand-ivory/70">
            {contactChannels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                className="flex items-start gap-3 rounded-2xl border border-transparent p-1 transition hover:border-brand-beige/10 hover:bg-brand-ivory/4 hover:text-brand-gold"
              >
                <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-brand-beige/10 bg-brand-ivory/5 text-brand-beige/85">
                  {renderContactIcon(channel.label)}
                </span>
                <span className="min-w-0">
                  <span className="sr-only">{channel.label}</span>
                  <span className="block text-brand-ivory">{channel.value}</span>
                  <span className="mt-1 block text-xs leading-5 text-brand-ivory/60">
                    {channel.note}
                  </span>
                </span>
              </a>
            ))}
            {!contactChannels.length ? <p>Os dados de contato serão preenchidos no painel.</p> : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-brand-beige/10 px-4 py-4 text-center text-xs uppercase tracking-[0.24em] text-brand-ivory/42 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:text-left lg:px-8">
        <span>
          {brand.name} - {brand.subtitle}
        </span>

        <Link
          href="/admin/login"
          className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-brand-beige/10 bg-brand-ivory/4 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.24em] text-brand-ivory/52 transition hover:border-brand-gold/30 hover:bg-brand-ivory/6 hover:text-brand-gold lg:self-auto"
        >
          <LockKeyhole className="size-3.5" />
          Painel
        </Link>
      </div>
    </footer>
  );
}
