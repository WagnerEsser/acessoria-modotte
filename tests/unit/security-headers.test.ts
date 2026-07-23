import { describe, expect, it } from "vitest";

import {
  getContentSecurityPolicy,
  getSecurityHeaders,
} from "../../security-headers.mjs";

describe("security headers", () => {
  it("keeps production headers aligned for Next and sensitive responses", () => {
    const headers = new Map(
      getSecurityHeaders(true).map(({ key, value }) => [key, value])
    );
    const policy = headers.get("Content-Security-Policy");

    expect(policy).toBe(getContentSecurityPolicy(true));
    expect(policy).toContain(
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com"
    );
    expect(policy).toContain("frame-src https://challenges.cloudflare.com");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload"
    );
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("does not emit HSTS for the local HTTP development server", () => {
    const headers = new Map(
      getSecurityHeaders(false).map(({ key, value }) => [key, value])
    );

    expect(headers.has("Strict-Transport-Security")).toBe(false);
    expect(headers.get("Content-Security-Policy")).toContain("'unsafe-eval'");
  });
});
