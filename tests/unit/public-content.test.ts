import { afterEach, describe, expect, it, vi } from "vitest";

const publicClientMock = vi.hoisted(() => ({
  client: null as null | {
    from: (table: string) => unknown;
  },
}));

vi.mock("@/lib/supabase/public", async () => {
  const { createFallbackSupabaseClient } = await vi.importActual<
    typeof import("@/lib/supabase/fallback")
  >("@/lib/supabase/fallback");

  return {
    createSupabasePublicClient: () =>
      publicClientMock.client ?? createFallbackSupabaseClient(),
  };
});

import { brand } from "@/lib/brand";
import {
  getPublicContactChannels,
  getPublicNeighborhoods,
  getPublicSiteSettings,
  splitParagraphs,
  type PublicSiteSettings,
} from "@/lib/public-content";

type MockRows = Record<string, Array<Record<string, unknown>>>;

function createQueryBuilder(rows: Array<Record<string, unknown>>) {
  let currentRows = [...rows];
  let count: number | null = null;

  const builder = {
    select(_columns: string, options?: { count?: "exact"; head?: boolean }) {
      if (options?.count === "exact") {
        count = currentRows.length;
      }

      return builder;
    },
    eq(column: string, value: unknown) {
      currentRows = currentRows.filter((row) => row[column] === value);

      return builder;
    },
    neq(column: string, value: unknown) {
      currentRows = currentRows.filter((row) => row[column] !== value);

      return builder;
    },
    order() {
      return builder;
    },
    maybeSingle() {
      return Promise.resolve({ data: currentRows[0] ?? null, error: null });
    },
    then<TResult1 = { data: typeof currentRows; count: typeof count; error: null }, TResult2 = never>(
      onfulfilled?:
        | ((
            value: { data: typeof currentRows; count: typeof count; error: null },
          ) => TResult1 | PromiseLike<TResult1>)
        | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return Promise.resolve({ data: currentRows, count, error: null }).then(
        onfulfilled,
        onrejected,
      );
    },
  };

  return builder;
}

function createMockSupabaseClient(rowsByTable: MockRows) {
  return {
    from(table: string) {
      return createQueryBuilder(rowsByTable[table] ?? []);
    },
  };
}

describe("public content helpers", () => {
  afterEach(() => {
    publicClientMock.client = null;
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
      showAreasNavigation: false,
    } satisfies PublicSiteSettings;

    const channels = getPublicContactChannels(settings);

    expect(channels[0].label).toBe("WhatsApp comercial");
    expect(channels[0].value).toBe("+55 47 98818-8967");
    expect(
      channels.some((channel) => channel.label === "E-mail institucional"),
    ).toBe(true);
    expect(channels.some((channel) => channel.label === "Instagram")).toBe(
      true,
    );
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
      showAreasNavigation: false,
    } satisfies PublicSiteSettings;

    const channels = getPublicContactChannels(settings);

    expect(
      channels.some((channel) => channel.label === "WhatsApp comercial"),
    ).toBe(false);
    expect(channels.some((channel) => channel.label === "Telefone")).toBe(true);
  });

  it("returns only neighborhoods with visible published properties", async () => {
    publicClientMock.client = createMockSupabaseClient({
      neighborhoods: [
        {
          id: "centro-id",
          slug: "centro",
          name: "Centro",
          city: "Balneário Camboriú",
          state: "SC",
          intro_text: null,
          seo_title: null,
          seo_description: null,
          is_published: true,
          sort_order: 1,
          updated_at: "2026-07-23T00:00:00.000Z",
        },
        {
          id: "sao-marcos-id",
          slug: "sao-marcos",
          name: "São Marcos",
          city: "Joinville",
          state: "SC",
          intro_text: null,
          seo_title: null,
          seo_description: null,
          is_published: true,
          sort_order: 2,
          updated_at: "2026-07-23T00:00:00.000Z",
        },
      ],
      properties: [
        {
          neighborhood_id: "centro-id",
          is_published: true,
          status: "hidden",
        },
        {
          neighborhood_id: "sao-marcos-id",
          is_published: true,
          status: "published",
        },
        {
          neighborhood_id: "centro-id",
          is_published: false,
          status: "published",
        },
      ],
    });

    const neighborhoods = await getPublicNeighborhoods();

    expect(neighborhoods).toHaveLength(1);
    expect(neighborhoods[0]).toMatchObject({
      slug: "sao-marcos",
      propertyCount: 1,
    });
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
    expect(settings.showAreasNavigation).toBe(false);
  });
});
