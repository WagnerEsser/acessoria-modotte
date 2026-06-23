import { describe, expect, it } from "vitest";

import { brand } from "@/lib/brand";

describe("brand", () => {
  it("exposes the expected identity", () => {
    expect(brand.name).toBe("Luana Modotte");
    expect(brand.subtitle).toBe("Assessoria Imobiliária");
    expect(brand.slogan).toContain("coração");
    expect(brand.colors.navy).toBe("#0B1B2C");
  });
});
