import { describe, expect, it } from "vitest";

import { getVisiblePublicNavigation, publicNavigation } from "@/lib/navigation";

describe("public navigation", () => {
  it("keeps optional routes registered while hiding disabled links", () => {
    expect(publicNavigation.map((item) => item.href)).toContain("/areas");

    const navigation = getVisiblePublicNavigation({
      showAreasNavigation: false,
    });

    expect(navigation.map((item) => item.href)).not.toContain("/areas");
  });

  it("shows the areas route independently", () => {
    const areasNavigation = getVisiblePublicNavigation({
      showAreasNavigation: true,
    });

    expect(areasNavigation.map((item) => item.href)).toContain("/areas");
  });
});
