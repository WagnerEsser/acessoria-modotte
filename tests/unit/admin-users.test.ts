import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const userMocks = vi.hoisted(() => ({
  getAdminRequestContext: vi.fn(),
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();

  return {
    ...actual,
    getAdminRequestContext: userMocks.getAdminRequestContext,
  };
});

vi.mock("@/lib/supabase/service", () => ({
  createSupabaseServiceClient: () => ({
    auth: {
      admin: {
        createUser: userMocks.createUser,
        deleteUser: userMocks.deleteUser,
      },
    },
    from: () => ({
      upsert: userMocks.upsert,
    }),
  }),
}));

import { POST } from "@/app/api/admin/users/route";

function createRequest(
  values: Record<string, string>,
  origin = "https://example.com"
) {
  return new NextRequest("https://example.com/api/admin/users", {
    method: "POST",
    headers: {
      origin,
      "sec-fetch-site":
        origin === "https://example.com" ? "same-origin" : "cross-site",
    },
    body: new URLSearchParams(values),
  });
}

const validUser = {
  full_name: "Maria Gestora",
  email: "maria@example.com",
  password: "SenhaForte!2026",
};

describe("admin user creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userMocks.getAdminRequestContext.mockResolvedValue({
      isAuthorized: true,
      applyCookies: (response: NextResponse) => response,
    });
    userMocks.createUser.mockResolvedValue({
      data: { user: { id: "new-auth-user" } },
      error: null,
    });
    userMocks.upsert.mockResolvedValue({ error: null });
    userMocks.deleteUser.mockResolvedValue({ error: null });
  });

  it("rejects cross-origin creation before checking authorization", async () => {
    const response = await POST(
      createRequest(validUser, "https://evil.example")
    );

    expect(response.status).toBe(403);
    expect(userMocks.getAdminRequestContext).not.toHaveBeenCalled();
    expect(userMocks.createUser).not.toHaveBeenCalled();
  });

  it("rejects a request without an authorized administrator", async () => {
    userMocks.getAdminRequestContext.mockResolvedValue({
      isAuthorized: false,
    });

    const response = await POST(createRequest(validUser));

    expect(response.status).toBe(403);
    expect(userMocks.createUser).not.toHaveBeenCalled();
  });

  it("rejects a weak password", async () => {
    const response = await POST(
      createRequest({ ...validUser, password: "fraca" })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("error=invalid_input");
    expect(userMocks.createUser).not.toHaveBeenCalled();
  });

  it("creates an active administrator ready for login", async () => {
    const response = await POST(createRequest(validUser));

    expect(userMocks.createUser).toHaveBeenCalledWith({
      email: validUser.email,
      password: validUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: validUser.full_name,
      },
    });
    expect(userMocks.upsert).toHaveBeenCalledWith(
      {
        auth_user_id: "new-auth-user",
        full_name: validUser.full_name,
        email: validUser.email,
        role: "admin",
        is_active: true,
      },
      { onConflict: "auth_user_id" }
    );
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("status=created");
  });

  it("removes the auth account when profile activation fails", async () => {
    userMocks.upsert.mockResolvedValue({
      error: new Error("profile failure"),
    });

    const response = await POST(createRequest(validUser));

    expect(userMocks.deleteUser).toHaveBeenCalledWith("new-auth-user");
    expect(response.headers.get("location")).toContain("error=creation_failed");
  });
});
