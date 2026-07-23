import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { parsePropertyFormData } from "@/lib/admin-property-form";
import { parseLeadSubmission } from "@/lib/lead-submission";
import {
  hashRateLimitIdentifier,
  hashAuthRateLimitIdentifier,
  isTrustedMutationOrigin,
  readLimitedUrlEncodedForm,
} from "@/lib/security/request";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

describe("public lead security", () => {
  it("accepts bounded, normalized lead data", () => {
    const params = new URLSearchParams({
      name: "Maria da Silva",
      email: "maria@example.com",
      phone: "(11) 99999-9999",
      source: "contato",
      page_slug: "contato",
      message: "Quero comprar um imóvel.",
    });
    const parsed = parseLeadSubmission(params);

    expect(parsed.success).toBe(true);
    expect(parsed.data?.phone).toBe("11999999999");
  });

  it("rejects malformed or oversized lead data", () => {
    const params = new URLSearchParams({
      name: "A",
      email: "not-an-email",
      source: "contato",
      message: "x".repeat(3001),
    });

    expect(parseLeadSubmission(params).success).toBe(false);
  });

  it("hashes rate-limit identifiers without storing raw IP addresses", () => {
    vi.stubEnv("LEAD_RATE_LIMIT_SECRET", "a-secure-test-secret-with-more-than-32-characters");

    const hash = hashRateLimitIdentifier("203.0.113.10");

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain("203.0.113.10");
    vi.unstubAllEnvs();
  });

  it("separates authentication rate-limit identifiers from public leads", () => {
    vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "an-auth-secret-with-more-than-thirty-two-characters");
    vi.stubEnv("LEAD_RATE_LIMIT_SECRET", "a-lead-secret-with-more-than-thirty-two-characters");

    expect(hashAuthRateLimitIdentifier("203.0.113.10:admin@example.com")).not.toBe(
      hashRateLimitIdentifier("203.0.113.10:admin@example.com")
    );
    vi.unstubAllEnvs();
  });

  it("rejects cross-site mutation origins", () => {
    const sameOrigin = new NextRequest("http://localhost:3001/api/leads", {
      method: "POST",
      headers: {
        origin: "http://localhost:3001",
        "sec-fetch-site": "same-origin",
      },
    });
    const crossSite = new NextRequest("http://localhost:3001/api/leads", {
      method: "POST",
      headers: {
        origin: "https://attacker.example",
        "sec-fetch-site": "cross-site",
      },
    });

    expect(isTrustedMutationOrigin(sameOrigin)).toBe(true);
    expect(isTrustedMutationOrigin(crossSite)).toBe(false);
  });

  it("limits form bodies before parsing all input", async () => {
    const request = new NextRequest("http://localhost:3001/api/leads", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `message=${"x".repeat(128)}`,
    });

    await expect(readLimitedUrlEncodedForm(request, 32)).rejects.toThrow(
      "payload_too_large"
    );
  });

  it("fails closed for Turnstile when production is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");

    await expect(verifyTurnstileToken("", "203.0.113.10")).resolves.toBe(false);
    vi.unstubAllEnvs();
  });
});

describe("admin input security", () => {
  it("rejects out-of-range property values before reaching the database", () => {
    const formData = new FormData();
    formData.set("title", "Apartamento seguro");
    formData.set("property_type", "Apartamento");
    formData.set("city", "São Paulo");
    formData.set("state", "SP");
    formData.set("bedrooms", "999999");

    expect(parsePropertyFormData(formData)).toEqual({
      ok: false,
      error: "invalid_fields",
    });
  });
});
