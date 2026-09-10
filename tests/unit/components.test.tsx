import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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
import { PropertyForm } from "@/components/admin/property-form";
import { PropertyMap } from "@/components/site/property-map";
import { Button } from "@/components/ui/button";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
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

  it("renders Google Maps Embed API iframe when the key is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY", "maps-test-key");

    render(
      createElement(PropertyMap, {
        query: "Centro, Balneário Camboriú, SC",
        note: "Mapa com localização aproximada pela região do imóvel.",
      }),
    );

    const iframe = screen.getByTitle("Mapa da localização do imóvel");

    expect(iframe).toHaveAttribute(
      "src",
      "https://www.google.com/maps/embed/v1/place?key=maps-test-key&q=Centro%2C%20Balne%C3%A1rio%20Cambori%C3%BA%2C%20SC",
    );
    expect(
      screen.getByText("Mapa com localização aproximada pela região do imóvel."),
    ).toBeInTheDocument();
  });

  it("shows a fallback when Google Maps key is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY", "");

    render(createElement(PropertyMap, { query: "Centro, Balneário Camboriú, SC" }));

    expect(
      screen.getByText(/chave pública do Google Maps estiver configurada/i),
    ).toBeInTheDocument();
    expect(screen.queryByTitle("Mapa da localização do imóvel")).not.toBeInTheDocument();
  });

  it("renders an admin map preview when the property has a location", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY", "maps-test-key");

    render(
      createElement(PropertyForm, {
        action: "/api/admin/properties/property-1",
        redirectTo: "/admin/imoveis",
        submitLabel: "Salvar",
        values: {
          title: "Apartamento teste",
          city: "Joinville",
          state: "SC",
          neighborhoodName: "São Marcos",
          address: "Fernando Drefahl, 158",
        },
      }),
    );

    expect(screen.getByTitle("Prévia do mapa do imóvel")).toHaveAttribute(
      "src",
      "https://www.google.com/maps/embed/v1/place?key=maps-test-key&q=S%C3%A3o%20Marcos%2C%20Joinville%2C%20SC",
    );
  });

  it("renders the property description as a rich text editor", () => {
    const { container } = render(
      createElement(PropertyForm, {
        action: "/api/admin/properties/property-1",
        redirectTo: "/admin/imoveis",
        submitLabel: "Salvar",
        values: {
          description: "<p>Descrição com <strong>destaque</strong>.</p>",
        },
      }),
    );

    const editor = container.querySelector('[data-rich-text-name="description"]');
    const hiddenField = container.querySelector('input[name="description"]');

    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute("contenteditable", "true");
    expect(editor?.innerHTML).toBe("<p>Descrição com <strong>destaque</strong>.</p>");
    expect(hiddenField).toHaveAttribute("type", "hidden");
  });

  it("shows area units and masks property monetary and contact fields", () => {
    render(
      createElement(PropertyForm, {
        action: "/api/admin/properties/property-1",
        redirectTo: "/admin/imoveis",
        submitLabel: "Salvar",
        values: {
          price: "850000",
          condominiumFee: "850",
          iptuValue: "1800",
          zipCode: "88330000",
          contactPhone: "4733334444",
          contactWhatsapp: "47999999999",
        },
      }),
    );

    expect(screen.getByText("Área útil (m²)")).toBeInTheDocument();
    expect(screen.getByText("Área total (m²)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ex.: R$ 850.000,00")).toHaveValue("R$ 850.000,00");
    expect(screen.getByPlaceholderText("Ex.: R$ 850,00")).toHaveValue("R$ 850,00");
    expect(screen.getByPlaceholderText("Ex.: R$ 1.800,00")).toHaveValue("R$ 1.800,00");
    expect(screen.getByPlaceholderText("Ex.: 88330-000")).toHaveValue("88330-000");
    expect(screen.getByPlaceholderText("(11) 3333-4444")).toHaveValue("(47) 3333-4444");
    expect(screen.getByPlaceholderText("(11) 99999-9999")).toHaveValue("(47) 99999-9999");
  });

  it("formats property masks while typing", () => {
    render(
      createElement(PropertyForm, {
        action: "/api/admin/properties/property-1",
        redirectTo: "/admin/imoveis",
        submitLabel: "Salvar",
      }),
    );

    fireEvent.change(screen.getByPlaceholderText("Ex.: R$ 850.000,00"), {
      target: { value: "850000" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ex.: 88330-000"), {
      target: { value: "88330000" },
    });
    fireEvent.change(screen.getByPlaceholderText("(11) 99999-9999"), {
      target: { value: "47999999999" },
    });

    expect(screen.getByPlaceholderText("Ex.: R$ 850.000,00")).toHaveValue("R$ 850.000,00");
    expect(screen.getByPlaceholderText("Ex.: 88330-000")).toHaveValue("88330-000");
    expect(screen.getByPlaceholderText("(11) 99999-9999")).toHaveValue("(47) 99999-9999");
  });

  it("prefers coordinates for the admin map preview", () => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY", "maps-test-key");

    render(
      createElement(PropertyForm, {
        action: "/api/admin/properties/property-1",
        redirectTo: "/admin/imoveis",
        submitLabel: "Salvar",
        values: {
          city: "Joinville",
          state: "SC",
          address: "Fernando Drefahl, 158",
          showFullAddress: true,
          latitude: "-26.3044",
          longitude: "-48.8487",
        },
      }),
    );

    expect(screen.getByTitle("Prévia do mapa do imóvel")).toHaveAttribute(
      "src",
      "https://www.google.com/maps/embed/v1/place?key=maps-test-key&q=-26.3044%2C-48.8487",
    );
  });

  it("updates the admin map preview while location fields are edited", () => {
    vi.useFakeTimers();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY", "maps-test-key");

    render(
      createElement(PropertyForm, {
        action: "/api/admin/properties/property-1",
        redirectTo: "/admin/imoveis",
        submitLabel: "Salvar",
        values: {
          city: "Joinville",
          state: "SC",
          showFullAddress: true,
          address: "Fernando Drefahl, 158",
        },
      }),
    );

    fireEvent.input(screen.getByPlaceholderText("Ex.: Avenida Brasil, 1000"), {
      target: { value: "Rua Nova, 200" },
    });
    fireEvent.input(screen.getByPlaceholderText("Ex.: Centro"), {
      target: { value: "América" },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTitle("Prévia do mapa do imóvel")).toHaveAttribute(
      "src",
      "https://www.google.com/maps/embed/v1/place?key=maps-test-key&q=Rua%20Nova%2C%20200%2C%20Am%C3%A9rica%2C%20Joinville%2C%20SC",
    );
  });

  it("shows the admin map preview after location fields are filled on a new property", () => {
    vi.useFakeTimers();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY", "maps-test-key");

    render(
      createElement(PropertyForm, {
        action: "/api/admin/properties",
        redirectTo: "/admin/imoveis",
        submitLabel: "Salvar",
        values: {
          transactionType: "sale",
          showFullAddress: true,
          showMap: true,
        },
      }),
    );

    expect(screen.queryByTitle("Prévia do mapa do imóvel")).not.toBeInTheDocument();

    fireEvent.input(screen.getByPlaceholderText("Ex.: Balneário Camboriú"), {
      target: { value: "Joinville" },
    });
    fireEvent.input(screen.getByPlaceholderText("Ex.: SC"), {
      target: { value: "SC" },
    });
    fireEvent.input(screen.getByPlaceholderText("Ex.: Centro"), {
      target: { value: "América" },
    });
    fireEvent.input(screen.getByPlaceholderText("Ex.: Avenida Brasil, 1000"), {
      target: { value: "Rua Nova, 200" },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTitle("Prévia do mapa do imóvel")).toHaveAttribute(
      "src",
      "https://www.google.com/maps/embed/v1/place?key=maps-test-key&q=Rua%20Nova%2C%20200%2C%20Am%C3%A9rica%2C%20Joinville%2C%20SC",
    );
  });

  it("updates the admin map preview when full address visibility changes", () => {
    vi.useFakeTimers();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY", "maps-test-key");

    render(
      createElement(PropertyForm, {
        action: "/api/admin/properties/property-1",
        redirectTo: "/admin/imoveis",
        submitLabel: "Salvar",
        values: {
          city: "Joinville",
          state: "SC",
          neighborhoodName: "São Marcos",
          address: "Fernando Drefahl, 158",
          showFullAddress: true,
          latitude: "-26.3044",
          longitude: "-48.8487",
        },
      }),
    );

    expect(screen.getByTitle("Prévia do mapa do imóvel")).toHaveAttribute(
      "src",
      "https://www.google.com/maps/embed/v1/place?key=maps-test-key&q=-26.3044%2C-48.8487",
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /mostrar endereço completo/i }));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTitle("Prévia do mapa do imóvel")).toHaveAttribute(
      "src",
      "https://www.google.com/maps/embed/v1/place?key=maps-test-key&q=S%C3%A3o%20Marcos%2C%20Joinville%2C%20SC",
    );
  });

  it("hides the admin map preview when map visibility is turned off", () => {
    vi.useFakeTimers();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY", "maps-test-key");

    render(
      createElement(PropertyForm, {
        action: "/api/admin/properties/property-1",
        redirectTo: "/admin/imoveis",
        submitLabel: "Salvar",
        values: {
          city: "Joinville",
          state: "SC",
          neighborhoodName: "São Marcos",
          showMap: true,
        },
      }),
    );

    expect(screen.getByTitle("Prévia do mapa do imóvel")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: /mostrar mapa/i }));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.queryByTitle("Prévia do mapa do imóvel")).not.toBeInTheDocument();
  });
});
