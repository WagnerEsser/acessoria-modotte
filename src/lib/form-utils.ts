export function readFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function readFormBoolean(formData: FormData, key: string): boolean {
  const value = readFormValue(formData, key).toLowerCase();

  return value === "on" || value === "true" || value === "1" || value === "yes";
}

export function parseNumberField(value: string): number | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const compact = normalized.replace(/\s/g, "");
  const decimalNormalized =
    compact.includes(",") && compact.includes(".")
      ? compact.replace(/\./g, "").replace(",", ".")
      : compact.replace(",", ".");
  const parsed = Number(decimalNormalized.replace(/[^\d.-]/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sanitizeInternalRedirect(value: string | null | undefined, fallback = "/") {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.startsWith("//")) {
    return fallback;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    return fallback;
  }

  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  return trimmed;
}
