"use client";

import { useEffect, useRef, useState } from "react";

export type PropertyMapPreviewValues = {
  address?: string;
  neighborhoodName?: string;
  city?: string;
  state?: string;
  latitude?: string;
  longitude?: string;
  showFullAddress?: boolean;
  showMap?: boolean;
};

type PropertyMapPreviewProps = {
  initialValues?: PropertyMapPreviewValues;
  mapsEmbedApiKey: string;
};

const FIELD_NAMES = [
  "address",
  "neighborhood_name",
  "city",
  "state",
  "latitude",
  "longitude",
  "show_full_address",
  "show_map",
];

function buildMapQuery(values: PropertyMapPreviewValues) {
  if (values.showMap === false) {
    return "";
  }

  if (!values.showFullAddress) {
    return [
      values.neighborhoodName,
      values.city,
      values.state,
    ]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(", ");
  }

  const latitude = values.latitude?.trim();
  const longitude = values.longitude?.trim();

  if (latitude && longitude) {
    return `${latitude},${longitude}`;
  }

  return [
    values.address,
    values.neighborhoodName,
    values.city,
    values.state,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

function readFieldValue(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);

  return field instanceof HTMLInputElement ? field.value : "";
}

function readCheckboxValue(form: HTMLFormElement, name: string) {
  const field = form.elements.namedItem(name);

  return field instanceof HTMLInputElement ? field.checked : false;
}

function readFormValues(form: HTMLFormElement): PropertyMapPreviewValues {
  return {
    address: readFieldValue(form, "address"),
    neighborhoodName: readFieldValue(form, "neighborhood_name"),
    city: readFieldValue(form, "city"),
    state: readFieldValue(form, "state"),
    latitude: readFieldValue(form, "latitude"),
    longitude: readFieldValue(form, "longitude"),
    showFullAddress: readCheckboxValue(form, "show_full_address"),
    showMap: readCheckboxValue(form, "show_map"),
  };
}

export function PropertyMapPreview({
  initialValues,
  mapsEmbedApiKey,
}: PropertyMapPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mapQuery, setMapQuery] = useState(() => buildMapQuery(initialValues ?? {}));
  const mapUrl = mapQuery && mapsEmbedApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsEmbedApiKey)}&q=${encodeURIComponent(mapQuery)}`
    : null;

  useEffect(() => {
    const root = rootRef.current;
    const form = root?.closest("form");

    if (!form) {
      return;
    }

    const formElement = form;
    let timeoutId: number | undefined;

    function scheduleMapUpdate() {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setMapQuery(buildMapQuery(readFormValues(formElement)));
      }, 500);
    }

    FIELD_NAMES.forEach((name) => {
      const field = formElement.elements.namedItem(name);

      if (field instanceof HTMLInputElement) {
        field.addEventListener("input", scheduleMapUpdate);
        field.addEventListener("change", scheduleMapUpdate);
      }
    });
    scheduleMapUpdate();

    return () => {
      window.clearTimeout(timeoutId);
      FIELD_NAMES.forEach((name) => {
        const field = formElement.elements.namedItem(name);

        if (field instanceof HTMLInputElement) {
          field.removeEventListener("input", scheduleMapUpdate);
          field.removeEventListener("change", scheduleMapUpdate);
        }
      });
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={mapQuery ? "overflow-hidden rounded-3xl border border-brand-beige/12 bg-brand-navy/35" : "hidden"}
    >
      {!mapQuery ? null : mapUrl ? (
        <iframe
          key={mapUrl}
          title="Prévia do mapa do imóvel"
          src={mapUrl}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-72 w-full border-0"
        />
      ) : (
        <div className="flex h-72 items-center justify-center px-6 text-center text-sm leading-6 text-brand-ivory/62">
          A prévia do mapa será exibida quando a chave pública do Google Maps estiver configurada neste ambiente.
        </div>
      )}
    </div>
  );
}
