import { MapPin } from "lucide-react";

type PropertyMapProps = {
  query: string;
};

export function PropertyMap({ query }: PropertyMapProps) {
  if (!query.trim()) {
    return null;
  }

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Localização</p>
          <h2 className="mt-2 font-display text-3xl text-brand-ivory">Onde fica</h2>
        </div>
        <a href={externalUrl} target="_blank" rel="noreferrer" className="inline-flex cursor-pointer items-center gap-2 text-sm text-brand-gold hover:text-brand-ivory">
          <MapPin className="size-4" />
          Abrir no Google Maps
        </a>
      </div>
      <div className="overflow-hidden rounded-3xl border border-brand-beige/12 bg-brand-ivory/4">
        <iframe
          title="Mapa da localização do imóvel"
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-80 w-full border-0"
        />
      </div>
    </section>
  );
}
