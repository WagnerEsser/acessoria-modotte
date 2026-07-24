import { describe, expect, it } from "vitest";

import { getVisiblePublicNavigation, publicNavigation } from "@/lib/navigation";

describe("public navigation", () => {
  it("keeps optional routes registered while hiding disabled links", () => {
    expect(publicNavigation.map((item) => item.href)).toEqual(
      expect.arrayContaining(["/areas", "/blog"]),
    );

    const navigation = getVisiblePublicNavigation({
      showAreasNavigation: false,
      showBlogNavigation: false,
    });

    expect(navigation.map((item) => item.href)).not.toContain("/areas");
    expect(navigation.map((item) => item.href)).not.toContain("/blog");
  });

  it("shows each optional route independently", () => {
    const blogNavigation = getVisiblePublicNavigation({
      showAreasNavigation: false,
      showBlogNavigation: true,
    });
    const areasNavigation = getVisiblePublicNavigation({
      showAreasNavigation: true,
      showBlogNavigation: false,
    });

    expect(blogNavigation.map((item) => item.href)).toContain("/blog");
    expect(blogNavigation.map((item) => item.href)).not.toContain("/areas");
    expect(areasNavigation.map((item) => item.href)).toContain("/areas");
    expect(areasNavigation.map((item) => item.href)).not.toContain("/blog");
  });
});
