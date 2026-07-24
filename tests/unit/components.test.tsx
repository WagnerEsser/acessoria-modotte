import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { AdminShell } from "@/components/layout/admin-shell";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";

afterEach(cleanup);

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
});
