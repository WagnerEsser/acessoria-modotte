import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SubmitButton } from "@/components/ui/submit-button";

afterEach(cleanup);

describe("SubmitButton", () => {
  it("shows the regular action before submission", () => {
    render(
      <form>
        <SubmitButton pendingLabel="Salvando...">Salvar</SubmitButton>
      </form>,
    );

    const button = screen.getByRole("button", { name: "Salvar" });

    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy");
  });

  it("shows loading feedback and blocks duplicate submissions", () => {
    render(
      <form aria-label="Cadastro">
        <SubmitButton pendingLabel="Salvando...">Salvar</SubmitButton>
      </form>,
    );

    fireEvent.submit(screen.getByRole("form", { name: "Cadastro" }));

    const button = screen.getByRole("button", { name: "Salvando..." });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("data-loading", "true");
  });

  it("restores the action after returning from browser history", () => {
    render(
      <form aria-label="Cadastro">
        <SubmitButton pendingLabel="Salvando...">Salvar</SubmitButton>
      </form>,
    );

    fireEvent.submit(screen.getByRole("form", { name: "Cadastro" }));
    fireEvent(window, new Event("pageshow"));

    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });
});
