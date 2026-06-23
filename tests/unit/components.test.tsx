import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";

describe("components", () => {
  it("renders the brand mark", () => {
    render(createElement(BrandMark));

    expect(screen.getByText("Luana Modotte")).toBeInTheDocument();
    expect(screen.getByText("Assessoria Imobiliária")).toBeInTheDocument();
  });

  it("renders the button label", () => {
    render(createElement(Button, null, "Salvar rascunho"));

    expect(screen.getByRole("button", { name: /salvar rascunho/i })).toBeInTheDocument();
  });
});
