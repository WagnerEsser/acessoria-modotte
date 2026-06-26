import { afterEach, describe, expect, it, vi } from "vitest";

import { brand } from "@/lib/brand";
import {
  getPublicContactChannels,
  getPublicSiteSettings,
  splitParagraphs,
  type PublicSiteSettings,
} from "@/lib/public-content";

describe("public content helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("splits text into paragraphs", () => {
    expect(splitParagraphs("Primeiro parágrafo.\nSegundo parágrafo.")).toEqual([
      "Primeiro parágrafo.",
      "Segundo parágrafo.",
    ]);
  });

  it("builds contact channels from site settings", () => {
    const settings = {
      companyName: "Luana Modotte",
      brandName: "Luana Modotte",
      legalName: null,
      logoUrl: null,
      primaryColor: null,
      secondaryColor: null,
      accentColor: null,
      primaryPhone: "55 47 3333-4444",
      whatsappNumber: "55 47 988188967",
      email: "contato@luanamodotte.com.br",
      address: "Rua Exemplo, 123",
      city: "Balneário Camboriú",
      state: "SC",
      socialLinks: {
        instagram: "https://instagram.com/luana.modotte",
      },
      openingHours: [],
      impactPhrase: "Descrição institucional curta.",
      defaultSeoTitle: "Luana Modotte | Assessoria Imobiliária",
      defaultSeoDescription: "Descrição padrão.",
    } satisfies PublicSiteSettings;

    const channels = getPublicContactChannels(settings);

    expect(channels[0].label).toBe("WhatsApp comercial");
    expect(channels[0].value).toBe("+55 47 98818-8967");
    expect(channels.some((channel) => channel.label === "E-mail institucional")).toBe(true);
    expect(channels.some((channel) => channel.label === "Instagram")).toBe(true);
    expect(channels.some((channel) => channel.label === "Telefone")).toBe(true);
  });

  it("omits WhatsApp when the panel has no number configured", () => {
    const settings = {
      companyName: "Luana Modotte",
      brandName: "Luana Modotte",
      legalName: null,
      logoUrl: null,
      primaryColor: null,
      secondaryColor: null,
      accentColor: null,
      primaryPhone: "55 47 3333-4444",
      whatsappNumber: null,
      email: "contato@luanamodotte.com.br",
      address: null,
      city: null,
      state: null,
      socialLinks: {},
      openingHours: [],
      impactPhrase: "Descrição institucional curta.",
      defaultSeoTitle: "Luana Modotte | Assessoria Imobiliária",
      defaultSeoDescription: "Descrição padrão.",
    } satisfies PublicSiteSettings;

    const channels = getPublicContactChannels(settings);

    expect(channels.some((channel) => channel.label === "WhatsApp comercial")).toBe(false);
    expect(channels.some((channel) => channel.label === "Telefone")).toBe(true);
  });

  it("falls back to brand settings when supabase env is missing", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_INTERNAL_URL", "");
    vi.stubEnv("SUPABASE_PUBLIC_URL", "");
    vi.stubEnv("API_EXTERNAL_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_ANON_KEY", "");
    vi.stubEnv("ANON_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    const settings = await getPublicSiteSettings();

    expect(settings.brandName).toBe(brand.name);
    expect(settings.impactPhrase).toBe(brand.slogan);
    expect(settings.defaultSeoDescription).toBe(brand.slogan);
    expect(settings.whatsappNumber).toBeNull();
  });
});
