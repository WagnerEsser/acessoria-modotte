"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

type FeatureItem = {
  id: string;
  label: string;
  value: string;
};

type PropertyFeaturesEditorProps = {
  value?: string;
};

const suggestions = [
  "Piscina",
  "Churrasqueira",
  "Sacada",
  "Mobiliado",
  "Vista livre",
  "Aceita pets",
  "Elevador",
  "Portaria",
  "Área gourmet",
  "Próximo ao mar",
];

function createFeature(id: string, label = "", value = ""): FeatureItem {
  return {
    id,
    label,
    value,
  };
}

function parseFeatures(value: string | undefined): FeatureItem[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separatorIndex = line.indexOf(":");
      const id = `feature-${index}`;

      if (separatorIndex === -1) {
        return createFeature(id, line);
      }

      return createFeature(
        id,
        line.slice(0, separatorIndex).trim(),
        line.slice(separatorIndex + 1).trim(),
      );
    });
}

function serializeFeatures(features: FeatureItem[]) {
  return features
    .map((feature) => {
      const label = feature.label.trim();
      const value = feature.value.trim();

      if (!label) {
        return "";
      }

      return value ? `${label}: ${value}` : label;
    })
    .filter(Boolean)
    .join("\n");
}

export function PropertyFeaturesEditor({ value }: PropertyFeaturesEditorProps) {
  const [features, setFeatures] = useState(() => parseFeatures(value));
  const serializedFeatures = useMemo(() => serializeFeatures(features), [features]);

  function addFeature(label = "") {
    setFeatures((currentFeatures) => [
      ...currentFeatures,
      createFeature(`feature-${Date.now()}-${currentFeatures.length}`, label),
    ]);
  }

  function updateFeature(id: string, key: "label" | "value", nextValue: string) {
    setFeatures((currentFeatures) =>
      currentFeatures.map((feature) =>
        feature.id === id ? { ...feature, [key]: nextValue } : feature,
      ),
    );
  }

  function removeFeature(id: string) {
    setFeatures((currentFeatures) => currentFeatures.filter((feature) => feature.id !== id));
  }

  return (
    <div className="space-y-3">
      <textarea name="features" value={serializedFeatures} readOnly className="sr-only" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="ml-1 block text-[13px] text-brand-ivory/78">Características</span>
        </div>
        <button
          type="button"
          onClick={() => addFeature()}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-brand-beige/14 px-3 text-xs font-medium text-brand-ivory/72 transition hover:border-brand-gold/45 hover:text-brand-gold"
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar
        </button>
      </div>
      <div className="h-px bg-brand-beige/12" />

      {features.length ? (
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end"
            >
              <label className={index === 0 ? "space-y-2" : "space-y-0"}>
                {index === 0 ? (
                  <span className="ml-1 block text-[13px] text-brand-ivory/78">
                    Característica
                  </span>
                ) : null}
                <Input
                  aria-label={`Característica ${index + 1}`}
                  placeholder="Ex.: Piscina"
                  value={feature.label}
                  onChange={(event) => updateFeature(feature.id, "label", event.target.value)}
                />
              </label>
              <label className={index === 0 ? "space-y-2" : "space-y-0"}>
                {index === 0 ? (
                  <span className="ml-1 block text-[13px] text-brand-ivory/78">
                    Detalhe opcional
                  </span>
                ) : null}
                <Input
                  aria-label={`Detalhe ${index + 1}`}
                  placeholder="Ex.: Aquecida, gourmet, 24h"
                  value={feature.value}
                  onChange={(event) => updateFeature(feature.id, "value", event.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => removeFeature(feature.id)}
                className="grid size-11 place-items-center rounded-full text-brand-ivory/52 transition hover:bg-brand-ivory/8 hover:text-red-200"
                aria-label={`Remover característica ${index + 1}`}
                title="Remover"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-brand-ivory/58">
          Nenhuma característica adicionada.
        </p>
      )}

      <div className="space-y-2">
        <p className="ml-1 text-xs font-medium text-brand-ivory/58">Sugestões:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addFeature(suggestion)}
              className="rounded-full border border-brand-beige/12 px-3 py-1.5 text-xs text-brand-ivory/62 transition hover:border-brand-gold/45 hover:text-brand-gold"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
