import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigationMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: navigationMocks.usePathname,
  useRouter: () => ({
    refresh: navigationMocks.refresh,
    replace: navigationMocks.replace,
  }),
}));

vi.mock("@/components/ui/toast-provider", () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

import { AdminShell } from "@/components/layout/admin-shell";
import { UserActiveToggle } from "@/components/admin/user-active-toggle";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("components", () => {
  it("renders the brand mark", () => {
    render(createElement(BrandMark));

    expect(screen.getByText("Luana Modotte")).toBeInTheDocument();
    expect(screen.getByText("Assessoria Imobiliária")).toBeInTheDocument();
  });

  it("renders the button label", () => {
    render(createElement(Button, null, "Salvar rascunho"));

    expect(
      screen.getByRole("button", { name: /salvar rascunho/i }),
    ).toBeInTheDocument();
  });

  it("shows the verified user in the administrative shell", () => {
    navigationMocks.usePathname.mockReturnValue("/admin/dashboard");

    render(
      createElement(AdminShell, {
        currentUser: {
          name: "Maria Gestora",
          email: "maria@example.com",
        },
        children: createElement("div", null, "Conteúdo administrativo"),
      }),
    );

    expect(screen.getByText("Maria Gestora")).toBeInTheDocument();
    expect(screen.getByText("maria@example.com")).toBeInTheDocument();
  });

  it("renders the active user toggle inside its own client boundary", () => {
    render(
      createElement(UserActiveToggle, {
        action: "/api/admin/users/user-1",
        isActive: true,
      }),
    );

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });
});
