import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const settingsMocks = vi.hoisted(() => ({
  getAdminRequestContext: vi.fn(),
  maybeSingle: vi.fn(),
  upsert: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: settingsMocks.revalidatePath,
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();

  return {
    ...actual,
    getAdminRequestContext: settingsMocks.getAdminRequestContext,
  };
});

import { POST } from "@/app/api/admin/site-settings/route";

function createSupabaseMock() {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: settingsMocks.maybeSingle,
        }),
      }),
      upsert: settingsMocks.upsert,
    }),
  };
}

function createRequest(
  values: Record<string, string>,
  origin = "https://example.com",
) {
  return new NextRequest("https://example.com/api/admin/site-settings", {
    method: "POST",
    headers: {
      origin,
      "sec-fetch-site":
        origin === "https://example.com" ? "same-origin" : "cross-site",
    },
    body: new URLSearchParams({
      whatsapp_number: "",
      primary_phone: "",
      email: "",
      impact_phrase: "Atendimento imobiliário próximo e seguro.",
      instagram: "",
      redirect_to: "/admin/conteudos",
      ...values,
    }),
  });
}

describe("site settings navigation visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    settingsMocks.maybeSingle.mockResolvedValue({
      data: {
        company_name: "Luana Modotte",
        brand_name: "Luana Modotte",
        social_links: {},
        opening_hours: [],
      },
      error: null,
    });
    settingsMocks.upsert.mockResolvedValue({ error: null });
    settingsMocks.getAdminRequestContext.mockResolvedValue({
      supabase: createSupabaseMock(),
      applyCookies: (response: NextResponse) => response,
      isAuthorized: true,
    });
  });

  it("rejects cross-origin updates before checking authorization", async () => {
    const response = await POST(createRequest({}, "https://evil.example"));

    expect(response.status).toBe(403);
    expect(settingsMocks.getAdminRequestContext).not.toHaveBeenCalled();
    expect(settingsMocks.upsert).not.toHaveBeenCalled();
  });

  it("rejects updates without an active administrator", async () => {
    settingsMocks.getAdminRequestContext.mockResolvedValue({
      supabase: createSupabaseMock(),
      applyCookies: (response: NextResponse) => response,
      isAuthorized: false,
    });

    const response = await POST(createRequest({}));

    expect(response.status).toBe(303);
    expect(settingsMocks.upsert).not.toHaveBeenCalled();
  });

  it("persists enabled links independently and revalidates the public layout", async () => {
    const response = await POST(
      createRequest({
        show_blog_navigation: "on",
      }),
    );

    expect(settingsMocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        show_blog_navigation: true,
        show_areas_navigation: false,
      }),
      { onConflict: "singleton_key" },
    );
    expect(settingsMocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("status=updated");
  });

  it("persists both links as disabled when checkboxes are absent", async () => {
    await POST(createRequest({}));

    expect(settingsMocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        show_blog_navigation: false,
        show_areas_navigation: false,
      }),
      { onConflict: "singleton_key" },
    );
  });

  it("fails closed when the existing settings cannot be read", async () => {
    settingsMocks.maybeSingle.mockResolvedValue({
      data: null,
      error: { message: "database unavailable" },
    });

    const response = await POST(createRequest({ show_blog_navigation: "on" }));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("error=save_failed");
    expect(settingsMocks.upsert).not.toHaveBeenCalled();
    expect(settingsMocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("does not revalidate the public layout when persistence fails", async () => {
    settingsMocks.upsert.mockResolvedValue({
      error: { message: "database unavailable" },
    });

    const response = await POST(createRequest({ show_blog_navigation: "on" }));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("error=save_failed");
    expect(settingsMocks.revalidatePath).not.toHaveBeenCalled();
  });
});
