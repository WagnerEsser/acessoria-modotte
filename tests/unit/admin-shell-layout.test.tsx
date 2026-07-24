import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const layoutMocks = vi.hoisted(() => ({
  createSupabaseRscClient: vi.fn(),
  getVerifiedAdminIdentity: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/rsc", () => ({
  createSupabaseRscClient: layoutMocks.createSupabaseRscClient,
}));

vi.mock("@/lib/admin-identity", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin-identity")>();

  return {
    ...actual,
    getVerifiedAdminIdentity: layoutMocks.getVerifiedAdminIdentity,
  };
});

vi.mock("next/navigation", () => ({
  redirect: layoutMocks.redirect,
}));

import AdminShellLayout from "@/app/(admin)/admin/(shell)/layout";

describe("admin shell layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    layoutMocks.createSupabaseRscClient.mockResolvedValue({ client: true });
    layoutMocks.redirect.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("renders only the verified identity returned by the server", async () => {
    layoutMocks.getVerifiedAdminIdentity.mockResolvedValue({
      status: "authenticated",
      identity: {
        name: "Maria Gestora",
        email: "maria@example.com",
      },
    });

    const markup = renderToStaticMarkup(
      await AdminShellLayout({ children: <div>Painel</div> }),
    );

    expect(markup).toContain("Maria Gestora");
    expect(markup).toContain("maria@example.com");
    expect(markup).not.toContain("auth-user-id");
    expect(layoutMocks.redirect).not.toHaveBeenCalled();
  });

  it.each([
    ["anonymous", "session_expired"],
    ["unauthorized", "unauthorized"],
  ])("fails closed for a %s identity", async (status, errorCode) => {
    layoutMocks.getVerifiedAdminIdentity.mockResolvedValue({ status });

    await expect(
      AdminShellLayout({ children: <div>Painel</div> }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(layoutMocks.redirect).toHaveBeenCalledWith(
      expect.stringContaining(`error=${errorCode}`),
    );
  });
});
