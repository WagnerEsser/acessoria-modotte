import { describe, expect, it } from "vitest";

import { formatCurrencyBRL, formatDateBRL, formatDateTimeBRL } from "@/lib/formatters";

describe("formatters", () => {
  it("formats currency as BRL", () => {
    expect(formatCurrencyBRL(2480000)).toContain("R$");
    expect(formatCurrencyBRL("1680000")).toContain("R$");
    expect(formatCurrencyBRL(null)).toBe("Sob consulta");
  });

  it("formats dates for the dashboard", () => {
    expect(formatDateBRL("2026-06-23T10:00:00Z")).toContain("2026");
    expect(formatDateTimeBRL("2026-06-23T10:00:00Z")).toContain("2026");
  });
});
