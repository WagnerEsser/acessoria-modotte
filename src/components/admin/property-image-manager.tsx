"use client";

import { ChevronLeft, ChevronRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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

type SelectedImagePreview = {
  id: string;
  file: File;
  url: string;
  isCover: boolean;
};

type GalleryItem =
  | { kind: "new"; preview: SelectedImagePreview }
  | { kind: "existing"; image: ManagedPropertyImage };

export function PropertyImageManager({ initialImages = [] }: PropertyImageManagerProps) {
  const images = initialImages;
  const [coverId, setCoverId] = useState(initialImages.find((image) => image.isCover)?.id ?? "");
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<SelectedImagePreview[]>([]);
  const [galleryPage, setGalleryPage] = useState(0);
  const [galleryDirection, setGalleryDirection] = useState<"next" | "previous">("next");
  const previewsRef = useRef<SelectedImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, []);

  const visibleImages = useMemo(
    () => images.filter((image) => !removedIds.includes(image.id)),
    [images, removedIds],
  );
  const galleryItems = useMemo<GalleryItem[]>(
    () => [
      ...selectedPreviews.map((preview) => ({ kind: "new" as const, preview })),
      ...visibleImages.map((image) => ({ kind: "existing" as const, image })),
    ],
    [selectedPreviews, visibleImages],
  );
  const galleryPageSize = 8;
  const galleryTotalPages = Math.max(1, Math.ceil(galleryItems.length / galleryPageSize));

  useEffect(() => {
    if (galleryPage >= galleryTotalPages) {
      setGalleryPage(galleryTotalPages - 1);
    }
  }, [galleryPage, galleryTotalPages]);

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
    const files = Array.from(event.target.files ?? []);
    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
    const previews = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      file,
      url: URL.createObjectURL(file),
      isCover: false,
    }));
    previewsRef.current = previews;
    setSelectedFiles(files);
    setSelectedPreviews(previews);
  }

  function removeSelectedImage(id: string) {
    const remaining = selectedPreviews.filter((preview) => preview.id !== id);
    const nextPreviews = remaining;
    const remainingFiles = nextPreviews.map((preview) => preview.file);
    const dataTransfer = new DataTransfer();

    remainingFiles.forEach((file) => dataTransfer.items.add(file));
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }

    URL.revokeObjectURL(selectedPreviews.find((preview) => preview.id === id)?.url ?? "");
    previewsRef.current = nextPreviews;
    setSelectedFiles(remainingFiles);
    setSelectedPreviews(nextPreviews);
  }

  function setSelectedImageAsCover(id: string) {
    const nextPreviews = selectedPreviews.map((preview) => ({ ...preview, isCover: preview.id === id }));
    previewsRef.current = nextPreviews;
    setSelectedPreviews(nextPreviews);
  }

  function changeGalleryPage(nextPage: number) {
    if (nextPage < 0 || nextPage >= galleryTotalPages || nextPage === galleryPage) {
      return;
    }

    setGalleryDirection(nextPage > galleryPage ? "next" : "previous");
    setGalleryPage(nextPage);
  }

  return (
    <div className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Imagens</p>
        <h2 className="mt-2 font-display text-2xl text-brand-ivory">Galeria do imóvel</h2>
        <p className="mt-2 text-sm leading-6 text-brand-ivory/68">
          Adicione até 30 imagens em JPG, PNG, WebP ou AVIF. A primeira imagem será usada como capa quando nenhuma for escolhida.
        </p>
      </div>

      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-gold/35 bg-brand-navy/40 px-4 py-5 text-center transition hover:border-brand-gold/65 hover:bg-brand-navy/65">
        <ImagePlus className="size-5 text-brand-gold" />
        <span className="text-sm text-brand-ivory">Selecionar imagens</span>
        <span className="text-xs text-brand-ivory/55">Você pode selecionar várias de uma vez</span>
        <input
          ref={fileInputRef}
          name="images"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
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

      {galleryItems.length ? (
        <div className="space-y-3">
          <div
            key={galleryPage}
            className={cn(
              "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
              galleryDirection === "next" ? "animate-[gallery-slide-next_240ms_ease-out]" : "animate-[gallery-slide-previous_240ms_ease-out]",
            )}
          >
            {galleryItems.slice(galleryPage * galleryPageSize, (galleryPage + 1) * galleryPageSize).map((item) => {
              if (item.kind === "new") {
                const { preview } = item;

                return (
                  <div key={preview.id} className="overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-navy/55">
                    <img src={preview.url} alt={`Prévia de ${preview.file.name}`} className="aspect-[4/3] w-full object-cover" />
                    <div className="flex items-center justify-between gap-2 p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedImageAsCover(preview.id)}
                        className={cn(
                          "inline-flex min-w-0 cursor-pointer items-center gap-1.5 text-xs transition",
                          preview.isCover ? "text-brand-gold" : "text-brand-ivory/62 hover:text-brand-gold",
                        )}
                        aria-pressed={preview.isCover}
                        title={preview.isCover ? "Imagem definida como capa" : "Usar como capa"}
                      >
                        <Star className={cn("size-4 shrink-0", preview.isCover && "fill-current")} aria-hidden="true" />
                        <span className="truncate">{preview.isCover ? "Capa" : "Usar capa"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(preview.id)}
                        className="inline-flex shrink-0 cursor-pointer items-center text-brand-ivory/58 transition hover:text-red-200"
                        aria-label={`Remover imagem ${preview.file.name}`}
                        title="Remover imagem"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              }

              const { image } = item;
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
                      <Star className={cn("size-4", isCover && "fill-current")} aria-hidden="true" />
                      {isCover ? "Capa" : "Usar capa"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="inline-flex cursor-pointer items-center text-brand-ivory/58 transition hover:text-red-200"
                      aria-label={`Remover imagem ${image.altText ?? "do imóvel"}`}
                      title="Remover imagem"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {galleryTotalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="ml-1 text-[13px] text-brand-ivory/78">
                Imagens {galleryPage * galleryPageSize + 1}-{Math.min((galleryPage + 1) * galleryPageSize, galleryItems.length)} de {galleryItems.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => changeGalleryPage(galleryPage - 1)}
                  disabled={galleryPage === 0}
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-brand-ivory/65 transition hover:bg-brand-ivory/8 hover:text-brand-ivory disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Imagens anteriores"
                  title="Imagens anteriores"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => changeGalleryPage(galleryPage + 1)}
                  disabled={galleryPage === galleryTotalPages - 1}
                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-brand-ivory/65 transition hover:bg-brand-ivory/8 hover:text-brand-ivory disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Próximas imagens"
                  title="Próximas imagens"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}
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
      {selectedPreviews.some((preview) => preview.isCover) ? (
        <input type="hidden" name="new_cover_image_index" value={selectedPreviews.findIndex((preview) => preview.isCover)} />
      ) : null}
    </div>
  );
}
