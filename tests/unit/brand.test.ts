import { describe, expect, it } from "vitest";

import { brand } from "@/lib/brand";

describe("brand", () => {
  it("exposes the expected identity", () => {
    expect(brand.name).toBe("Luana Modotte");
    expect(brand.subtitle).toBe("Assessoria Imobiliaria");
    expect(brand.slogan).toContain("coracao");
    expect(brand.colors.navy).toBe("#0B1B2C");
  });
});
