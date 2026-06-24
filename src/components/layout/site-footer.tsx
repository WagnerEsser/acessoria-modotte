import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { getPublicContactChannels, type PublicSiteSettings } from "@/lib/public-content";
import { brand } from "@/lib/brand";
import { publicNavigation } from "@/lib/navigation";

type SiteFooterProps = {
  siteSettings: PublicSiteSettings;
};

export function SiteFooter({ siteSettings }: SiteFooterProps) {
  const contactChannels = getPublicContactChannels(siteSettings).slice(0, 4);

  return (
    <footer className="border-t border-brand-beige/10 bg-brand-ink/96">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr] lg:px-8">
        <div className="space-y-5">
          <BrandMark compact />
          <p className="max-w-md text-sm leading-6 text-brand-ivory/68">
            {siteSettings.impactPhrase}
          </p>
          <p className="text-xs uppercase tracking-[0.24em] text-brand-beige/55">
            Assessoria imobiliária nova, com foco em clareza e contato direto.
          </p>
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
              <a key={channel.label} href={channel.href} className="block transition hover:text-brand-gold">
                {channel.label}: {channel.value}
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
