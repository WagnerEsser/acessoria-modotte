import { createHmac } from "node:crypto";

import type { NextRequest } from "next/server";

import { siteUrl } from "@/lib/site";

const MAX_FORM_BODY_BYTES = 16 * 1024;

function normalizeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalDevelopmentOrigin(origin: string) {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const url = new URL(origin);

    return (
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

export function isTrustedMutationOrigin(request: NextRequest) {
  const origin = normalizeOrigin(request.headers.get("origin"));
  const requestOrigin = normalizeOrigin(request.nextUrl.origin);
  const configuredOrigin = normalizeOrigin(siteUrl);

  if (!origin || !requestOrigin || request.headers.get("sec-fetch-site") === "cross-site") {
    return false;
  }

  if (origin !== requestOrigin) {
    return false;
  }

  return origin === configuredOrigin || isLocalDevelopmentOrigin(origin);
}

export function getTrustedRedirectOrigin(request: NextRequest) {
  const requestOrigin = normalizeOrigin(request.nextUrl.origin);

  if (
    requestOrigin &&
    (requestOrigin === normalizeOrigin(siteUrl) || isLocalDevelopmentOrigin(requestOrigin))
  ) {
    return requestOrigin;
  }

  return siteUrl;
}

export function getClientIp(request: NextRequest) {
  const candidate =
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  return candidate.slice(0, 64);
}

export function hashRateLimitIdentifier(identifier: string) {
  const secret =
    process.env.LEAD_RATE_LIMIT_SECRET?.trim() ||
    (process.env.NODE_ENV !== "production"
      ? process.env.JWT_SECRET?.trim() || process.env.SERVICE_ROLE_KEY?.trim()
      : "");

  if (!secret || secret.length < 32) {
    throw new Error("LEAD_RATE_LIMIT_SECRET precisa ter pelo menos 32 caracteres.");
  }

  return createHmac("sha256", secret).update(identifier).digest("hex");
}

export function hashAuthRateLimitIdentifier(identifier: string) {
  const secret =
    process.env.AUTH_RATE_LIMIT_SECRET?.trim() ||
    (process.env.NODE_ENV !== "production"
      ? process.env.JWT_SECRET?.trim() || process.env.SERVICE_ROLE_KEY?.trim()
      : "");

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_RATE_LIMIT_SECRET precisa ter pelo menos 32 caracteres.");
  }

  return createHmac("sha256", secret)
    .update(`admin-auth:${identifier}`)
    .digest("hex");
}

export async function readLimitedUrlEncodedForm(
  request: NextRequest,
  maxBytes = MAX_FORM_BODY_BYTES
) {
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim();

  if (contentType !== "application/x-www-form-urlencoded") {
    throw new Error("unsupported_media_type");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error("payload_too_large");
  }

  if (!request.body) {
    return new URLSearchParams();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    receivedBytes += value.byteLength;

    if (receivedBytes > maxBytes) {
      await reader.cancel();
      throw new Error("payload_too_large");
    }

    chunks.push(value);
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(body);

  return new URLSearchParams(decoded);
}
