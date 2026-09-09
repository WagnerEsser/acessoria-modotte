import { describe, expect, it } from "vitest";

import { parsePropertyFormData } from "@/lib/admin-property-form";
import { validatePropertyImageFiles, validatePropertyVideoFiles } from "@/lib/admin-property-media";

function buildFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    title: "Casa com jardim",
    property_type: "Casa",
    transaction_type: "sale",
    commercial_status: "published",
    city: "Balneário Camboriú",
    state: "SC",
    address: "Rua das Flores, 100",
    show_full_address: "on",
    zip_code: "88330000",
    price: "1250000",
    bedrooms: "3",
    bathrooms: "2",
    garages: "2",
    area_useful: "180",
    condominium_fee: "850",
    iptu_value: "1200",
    built_year: "2020",
    furnished: "on",
    latitude: "-26.99",
    longitude: "-48.63",
    features: "Piscina: Sim\nVaranda gourmet\nAceita pets",
    description: "Uma casa ampla e iluminada para sua família.",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("admin property form", () => {
  it("parses the complete property payload", () => {
    const result = parsePropertyFormData(buildFormData());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.showFullAddress).toBe(true);
    expect(result.data.status).toBe("published");
    expect(result.data.condominiumFee).toBe(850);
    expect(result.data.latitude).toBe(-26.99);
    expect(result.data.features).toEqual([
      { label: "Piscina", value: "Sim", sortOrder: 0 },
      { label: "Varanda gourmet", value: null, sortOrder: 1 },
      { label: "Aceita pets", value: null, sortOrder: 2 },
    ]);
  });

  it("rejects coordinates outside geographic bounds", () => {
    const result = parsePropertyFormData(buildFormData({ latitude: "95" }));

    expect(result).toMatchObject({ ok: false, fieldErrors: { latitude: "Revise este campo." } });
  });
});

describe("property image validation", () => {
  it("accepts a valid PNG signature and rejects spoofed content", async () => {
    const validPng = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "house.png", { type: "image/png" });
    const spoofedPng = new File(["not an image"], "house.png", { type: "image/png" });

    await expect(validatePropertyImageFiles([validPng])).resolves.toBeNull();
    await expect(validatePropertyImageFiles([spoofedPng])).resolves.toContain("não pôde ser validada");
  });
});

describe("property video validation", () => {
  it("accepts a valid MP4 signature and rejects spoofed content", async () => {
    const validMp4 = new File([new Uint8Array([0, 0, 0, 20, 102, 116, 121, 112])], "tour.mp4", { type: "video/mp4" });
    const spoofedMp4 = new File(["not a video"], "tour.mp4", { type: "video/mp4" });

    await expect(validatePropertyVideoFiles([validMp4])).resolves.toBeNull();
    await expect(validatePropertyVideoFiles([spoofedMp4])).resolves.toContain("não pôde ser validado");
  });

  it("rejects a fourth video", async () => {
    const files = Array.from({ length: 4 }, (_, index) =>
      new File([new Uint8Array([0, 0, 0, 20, 102, 116, 121, 112])], `tour-${index}.mp4`, { type: "video/mp4" }),
    );

    await expect(validatePropertyVideoFiles(files)).resolves.toContain("no máximo 3 vídeos");
  });
});
