import { describe, expect, it } from "vitest";

import { publicNavigation } from "@/lib/navigation";
import { contactChannels, featuredProperties, services } from "@/lib/site-data";

describe("site data", () => {
  it("includes the core public content", () => {
    expect(featuredProperties.length).toBeGreaterThanOrEqual(4);
    expect(services.length).toBeGreaterThanOrEqual(3);
    expect(contactChannels[0].value).toContain("configurar");
    expect(publicNavigation.map((item) => item.href)).toContain("/imoveis");
  });
});
