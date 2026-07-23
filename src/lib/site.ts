export function normalizeSiteUrl(value: string | null | undefined) {
  const candidate = value?.trim();

  if (!candidate) {
    throw new Error("SITE_URL precisa estar configurada.");
  }

  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("SITE_URL deve usar o protocolo http ou https.");
  }

  return url.origin;
}

export const siteUrl = normalizeSiteUrl(process.env.SITE_URL);

export function absoluteSiteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}
