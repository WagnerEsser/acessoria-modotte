import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { brand } from "@/lib/brand";
import { publicNavigation } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-beige/10 bg-brand-ink/96">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr] lg:px-8">
        <div className="space-y-5">
          <BrandMark compact />
          <p className="max-w-md text-sm leading-6 text-brand-ivory/68">
            {brand.slogan}
          </p>
          <p className="text-xs uppercase tracking-[0.24em] text-brand-beige/55">
            Assessoria imobiliaria nova, com foco em clareza e contato direto.
          </p>
        </div>

        <div>
          <div className="mb-4 text-xs uppercase tracking-[0.28em] text-brand-beige/55">
            Navegacao
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
            <p>WhatsApp: a configurar no painel.</p>
            <p>E-mail: contato@luanamodotte.com.br</p>
            <p>Horario: seg a sex, 9h as 18h.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-beige/10 px-4 py-4 text-center text-xs uppercase tracking-[0.24em] text-brand-ivory/42 sm:px-6 lg:px-8">
        {brand.name} - {brand.subtitle}
      </div>
    </footer>
  );
}
