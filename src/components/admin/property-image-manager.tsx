"use client";

import { ImagePlus, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export type ManagedPropertyImage = {
  id: string;
  url: string;
  altText: string | null;
  isCover: boolean;
};

type PropertyImageManagerProps = {
  initialImages?: ManagedPropertyImage[];
};

export function PropertyImageManager({ initialImages = [] }: PropertyImageManagerProps) {
  const images = initialImages;
  const [coverId, setCoverId] = useState(initialImages.find((image) => image.isCover)?.id ?? "");
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const visibleImages = useMemo(
    () => images.filter((image) => !removedIds.includes(image.id)),
    [images, removedIds],
  );

  function removeImage(id: string) {
    setRemovedIds((current) => (current.includes(id) ? current : [...current, id]));

    if (id === coverId) {
      setCoverId(visibleImages.find((image) => image.id !== id)?.id ?? "");
    }
  }

  function restoreImage(id: string) {
    setRemovedIds((current) => current.filter((removedId) => removedId !== id));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFiles(Array.from(event.target.files ?? []));
  }

  return (
    <div className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Imagens</p>
        <h2 className="mt-2 font-display text-2xl text-brand-ivory">Galeria do imóvel</h2>
        <p className="mt-2 text-sm leading-6 text-brand-ivory/68">
          Adicione até 20 imagens em JPG, PNG, WebP ou AVIF. A primeira imagem será usada como capa quando nenhuma for escolhida.
        </p>
      </div>

      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-gold/35 bg-brand-navy/40 px-4 py-5 text-center transition hover:border-brand-gold/65 hover:bg-brand-navy/65">
        <ImagePlus className="size-5 text-brand-gold" />
        <span className="text-sm text-brand-ivory">Selecionar imagens</span>
        <span className="text-xs text-brand-ivory/55">Você pode selecionar várias de uma vez</span>
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      {selectedFiles.length ? (
        <p className="text-sm text-brand-ivory/72">
          {selectedFiles.length} {selectedFiles.length === 1 ? "imagem selecionada" : "imagens selecionadas"} para enviar.
        </p>
      ) : null}

      {visibleImages.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleImages.map((image) => {
            const isCover = image.id === coverId;

            return (
              <div key={image.id} className="overflow-hidden rounded-2xl border border-brand-beige/12 bg-brand-navy/55">
                <img src={image.url} alt={image.altText ?? "Imagem do imóvel"} className="aspect-[4/3] w-full object-cover" />
                <div className="flex items-center justify-between gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => setCoverId(image.id)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 text-xs transition",
                      isCover ? "text-brand-gold" : "text-brand-ivory/62 hover:text-brand-gold",
                    )}
                    aria-pressed={isCover}
                  >
                    <Star className={cn("size-4", isCover && "fill-current")} />
                    {isCover ? "Capa" : "Usar capa"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="inline-flex cursor-pointer items-center text-brand-ivory/58 transition hover:text-red-200"
                    aria-label={`Remover imagem ${image.altText ?? "do imóvel"}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {removedIds.length ? (
        <div className="space-y-2 rounded-2xl border border-red-300/20 bg-red-950/15 p-3 text-sm text-brand-ivory/72">
          <p>As imagens removidas serão excluídas ao salvar.</p>
          {images.filter((image) => removedIds.includes(image.id)).map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => restoreImage(image.id)}
              className="mr-3 cursor-pointer text-xs text-brand-gold underline underline-offset-4"
            >
              Restaurar {image.altText ?? "imagem"}
            </button>
          ))}
        </div>
      ) : null}

      {removedIds.map((id) => <input key={id} type="hidden" name="delete_image_ids" value={id} />)}
      {coverId ? <input type="hidden" name="cover_image_id" value={coverId} /> : null}
    </div>
  );
}
