"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, LocateFixed, MapPin, TriangleAlert } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PublicPropertyMapItem } from "@/lib/property-map";
import { cn } from "@/lib/utils";

type GoogleMapsGlobal = {
  maps?: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => unknown;
    LatLngBounds: new () => {
      extend: (position: { lat: number; lng: number }) => void;
    };
    InfoWindow: new (options?: Record<string, unknown>) => {
      open: (options: Record<string, unknown>) => void;
      close: () => void;
      setContent: (content: string) => void;
    };
    Marker?: new (options: Record<string, unknown>) => { setMap: (map: unknown | null) => void };
    Geocoder: new () => {
      geocode: (
        request: Record<string, unknown>,
        callback: (
          results: Array<{ geometry: { location: { lat: () => number; lng: () => number } } }> | null,
          status: string,
        ) => void,
      ) => void;
    };
    event?: {
      addListener: (target: unknown, eventName: string, callback: () => void) => void;
    };
    marker?: {
      AdvancedMarkerElement: new (options: Record<string, unknown>) => { map: unknown | null };
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsGlobal;
    __propertyMapApiPromise?: Promise<void>;
    __initPropertyMapApi?: () => void;
  }
}

type PropertyMapViewProps = {
  properties: PublicPropertyMapItem[];
  apiKey: string;
  mapId?: string;
};

type ResolvedMapItem = PublicPropertyMapItem & {
  position: {
    lat: number;
    lng: number;
  };
};

type MapMarker = {
  setMap?: (map: unknown | null) => void;
  map?: unknown | null;
};

type MapInfoWindow = {
  open: (options: Record<string, unknown>) => void;
  close: () => void;
  setContent: (content: string) => void;
};

const DEFAULT_CENTER = { lat: -26.3044, lng: -48.8487 };
const GEOCODE_CACHE_PREFIX = "property-map-geocode:";

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (window.__propertyMapApiPromise) {
    return window.__propertyMapApiPromise;
  }

  window.__propertyMapApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const callbackName = "__initPropertyMapApi";
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (settled) {
        return;
      }

      settled = true;
      delete window[callbackName];
      reject(new Error("google_maps_timeout"));
    }, 12000);
    const params = new URLSearchParams({
      key: apiKey,
      libraries: "marker",
      v: "weekly",
      callback: callbackName,
    });

    function finish() {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      resolve();
    }

    function fail() {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      reject(new Error("google_maps_load_failed"));
    }

    window[callbackName] = () => {
      finish();
    };
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        finish();
      }
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });

  return window.__propertyMapApiPromise;
}

function getCachedPosition(query: string) {
  try {
    const cachedValue = window.localStorage.getItem(`${GEOCODE_CACHE_PREFIX}${query}`);

    if (!cachedValue) {
      return null;
    }

    const parsed = JSON.parse(cachedValue) as { lat?: unknown; lng?: unknown };

    return typeof parsed.lat === "number" && typeof parsed.lng === "number"
      ? { lat: parsed.lat, lng: parsed.lng }
      : null;
  } catch {
    return null;
  }
}

function setCachedPosition(query: string, position: { lat: number; lng: number }) {
  try {
    window.localStorage.setItem(
      `${GEOCODE_CACHE_PREFIX}${query}`,
      JSON.stringify(position),
    );
  } catch {
    // Local storage is an optimization only.
  }
}

function geocodeAddress(query: string) {
  const cachedPosition = getCachedPosition(query);

  if (cachedPosition) {
    return Promise.resolve(cachedPosition);
  }

  const Geocoder = window.google?.maps?.Geocoder;

  if (!Geocoder) {
    return Promise.resolve(null);
  }

  const geocoder = new Geocoder();

  return new Promise<{ lat: number; lng: number } | null>((resolve) => {
    geocoder.geocode(
      {
        address: query,
        region: "BR",
      },
      (results, status) => {
        const location = status === "OK" ? results?.[0]?.geometry.location : null;

        if (!location) {
          resolve(null);
          return;
        }

        const position = {
          lat: location.lat(),
          lng: location.lng(),
        };

        setCachedPosition(query, position);
        resolve(position);
      },
    );
  });
}

function createInfoWindowContent(property: PublicPropertyMapItem) {
  const title = escapeHtml(property.title);
  const type = escapeHtml(property.type);
  const price = escapeHtml(property.price);
  const location = escapeHtml(
    [property.location, property.city].filter(Boolean).join(", "),
  );
  const href = escapeHtml(property.href);
  const coverImageUrl = property.coverImageUrl
    ? escapeHtml(property.coverImageUrl)
    : null;
  const coverImageAlt = escapeHtml(property.coverImageAlt ?? property.title);
  const image = coverImageUrl
    ? `<img src="${coverImageUrl}" alt="${coverImageAlt}" style="width:100%;height:112px;object-fit:cover;border-radius:10px;margin-bottom:10px;" />`
    : "";

  return `
    <article style="max-width:260px;color:#0b1b2c;font-family:Inter,Arial,sans-serif;">
      ${image}
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7b6a55;">${type}</p>
      <h3 style="margin:0 0 8px;font-size:16px;line-height:1.25;color:#0b1b2c;">${title}</h3>
      <p style="margin:0 0 8px;font-size:13px;color:#425062;">${location}</p>
      <p style="margin:0 0 12px;font-weight:700;font-size:14px;color:#0b1b2c;">${price}</p>
      <a href="${href}" style="display:inline-flex;align-items:center;border-radius:999px;background:#cbb28c;color:#0b1b2c;padding:8px 12px;text-decoration:none;font-weight:700;font-size:13px;">Ver imóvel</a>
    </article>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clearMarkers(markers: MapMarker[]) {
  markers.forEach((marker) => {
    if (typeof marker.setMap === "function") {
      marker.setMap(null);
      return;
    }

    marker.map = null;
  });
}

export function PropertyMapView({
  properties,
  apiKey,
  mapId,
}: PropertyMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<MapMarker[]>([]);
  const infoWindowRef = useRef<MapInfoWindow | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(properties[0]?.slug ?? "");
  const [resolvedProperties, setResolvedProperties] = useState<ResolvedMapItem[]>([]);
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [mapError, setMapError] = useState(false);

  const selectedProperty = useMemo(
    () =>
      resolvedProperties.find((property) => property.slug === selectedSlug) ??
      resolvedProperties[0],
    [resolvedProperties, selectedSlug],
  );

  useEffect(() => {
    setSelectedSlug(properties[0]?.slug ?? "");
  }, [properties]);

  useEffect(() => {
    let active = true;

    async function resolvePositions() {
      setMapError(false);

      if (!apiKey || !properties.length) {
        setResolvedProperties([]);
        setUnresolvedCount(0);
        return;
      }

      try {
        await loadGoogleMaps(apiKey);
      } catch {
        if (active) {
          setMapError(true);
        }
        return;
      }

      const resolved = await Promise.all(
        properties.map(async (property) => {
          if (property.latitude !== null && property.longitude !== null) {
            return {
              ...property,
              position: {
                lat: property.latitude,
                lng: property.longitude,
              },
            };
          }

          if (!property.geocodeQuery) {
            return null;
          }

          const position = await geocodeAddress(property.geocodeQuery);

          return position ? { ...property, position } : null;
        }),
      );

      if (!active) {
        return;
      }

      const nextResolved = resolved.filter(
        (property): property is ResolvedMapItem => Boolean(property),
      );

      setResolvedProperties(nextResolved);
      setUnresolvedCount(properties.length - nextResolved.length);
    }

    resolvePositions();

    return () => {
      active = false;
    };
  }, [apiKey, properties]);

  useEffect(() => {
    const mapElement = mapRef.current;
    const maps = window.google?.maps;

    if (!mapElement || !maps || !apiKey) {
      return;
    }

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new maps.Map(mapElement, {
        center: DEFAULT_CENTER,
        zoom: 11,
        mapId: mapId || undefined,
        fullscreenControl: true,
        mapTypeControl: false,
        streetViewControl: false,
      });
      infoWindowRef.current = new maps.InfoWindow();
    }

    clearMarkers(markersRef.current);
    markersRef.current = [];

    if (!resolvedProperties.length) {
      return;
    }

    const bounds = new maps.LatLngBounds();

    resolvedProperties.forEach((property) => {
      bounds.extend(property.position);

      const marker = maps.marker?.AdvancedMarkerElement && mapId
        ? new maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current,
            position: property.position,
            title: property.title,
          })
        : maps.Marker
          ? new maps.Marker({
              map: mapInstanceRef.current,
              position: property.position,
              title: property.title,
            })
          : null;

      if (!marker) {
        return;
      }

      maps.event?.addListener(marker, "click", () => {
        setSelectedSlug(property.slug);
        infoWindowRef.current?.setContent(createInfoWindowContent(property));
        infoWindowRef.current?.open({
          anchor: marker,
          map: mapInstanceRef.current,
        });
      });

      markersRef.current.push(marker);
    });

    const map = mapInstanceRef.current as {
      fitBounds: (bounds: unknown) => void;
      setCenter: (position: { lat: number; lng: number }) => void;
      setZoom: (zoom: number) => void;
    };

    if (resolvedProperties.length === 1) {
      map.setCenter(resolvedProperties[0].position);
      map.setZoom(15);
      return;
    }

    map.fitBounds(bounds);
  }, [apiKey, mapId, resolvedProperties]);

  if (!apiKey) {
    return (
      <Card className="p-8 text-sm leading-7 text-brand-ivory/70">
        O mapa será exibido quando a chave pública da Google Maps JavaScript API
        estiver configurada neste ambiente.
      </Card>
    );
  }

  if (!properties.length) {
    return (
      <Card className="p-8 text-sm leading-7 text-brand-ivory/70">
        Nenhum imóvel à venda com localização disponível para exibir no mapa.
      </Card>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-beige/15 bg-brand-navy/45">
        <div
          ref={mapRef}
          className="h-[34rem] min-h-[28rem] w-full bg-brand-navy/40"
          aria-label="Mapa com imóveis à venda"
        />
        {mapError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/88 px-6 text-center text-sm leading-6 text-brand-ivory/70">
            Não foi possível carregar o Google Maps. Verifique se a chave da
            Maps JavaScript API está ativa para este domínio.
          </div>
        ) : null}
      </div>

      <Card className="flex max-h-[34rem] flex-col p-0">
        <div className="border-b border-brand-beige/10 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-ivory">
            <LocateFixed className="size-4 text-brand-gold" />
            Imóveis no mapa
          </div>
          <p className="mt-2 text-xs leading-5 text-brand-ivory/55">
            {resolvedProperties.length === 1
              ? "1 imóvel à venda localizado"
              : `${resolvedProperties.length} imóveis à venda localizados`}
          </p>
          {unresolvedCount || mapError ? (
            <p className="mt-3 inline-flex items-start gap-2 text-xs leading-5 text-brand-beige/70">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {mapError
                ? "Não foi possível carregar o Google Maps agora."
                : `${unresolvedCount} imóvel não pôde ser localizado automaticamente.`}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {properties.map((property) => {
            const isResolved = resolvedProperties.some(
              (resolvedProperty) => resolvedProperty.slug === property.slug,
            );
            const isSelected = selectedProperty?.slug === property.slug;

            return (
              <button
                key={property.slug}
                type="button"
                disabled={!isResolved}
                onClick={() => setSelectedSlug(property.slug)}
                className={cn(
                  "mb-2 flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-3 text-left transition",
                  isSelected
                    ? "border-brand-gold/65 bg-brand-gold/10"
                    : "border-transparent bg-brand-ivory/4 hover:border-brand-beige/15 hover:bg-brand-ivory/7",
                  !isResolved && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gold/14 text-brand-gold">
                  <MapPin className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-5 text-brand-ivory">
                    {property.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-brand-ivory/58">
                    {[property.location, property.city].filter(Boolean).join(", ")}
                  </span>
                  <span className="mt-2 block text-xs font-semibold text-brand-gold">
                    {property.price}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {selectedProperty ? (
          <div className="border-t border-brand-beige/10 p-4">
            <Link
              href={selectedProperty.href}
              className={buttonVariants({
                variant: "gold",
                size: "sm",
                className: "w-full",
              })}
            >
              Ver imóvel selecionado
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
