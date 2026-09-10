import { MapPin } from "lucide-react";

type PropertyMapProps = {
  query: string;
  note?: string;
};

export function PropertyMap({ query, note }: PropertyMapProps) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return null;
  }

  const encodedQuery = encodeURIComponent(normalizedQuery);
  const mapsEmbedApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY?.trim();
  const mapUrl = mapsEmbedApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsEmbedApiKey)}&q=${encodedQuery}`
    : null;
  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

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
        {mapUrl ? (
          <iframe
            title="Mapa da localização do imóvel"
            src={mapUrl}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="h-80 w-full border-0"
          />
        ) : (
          <div className="flex h-80 items-center justify-center px-6 text-center text-sm leading-6 text-brand-ivory/62">
            O mapa será exibido quando a chave pública do Google Maps estiver configurada neste ambiente.
          </div>
        )}
      </div>
      {note ? <p className="text-xs leading-5 text-brand-ivory/42">{note}</p> : null}
    </section>
  );
}
