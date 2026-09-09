"use client";

import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

export type PropertyGalleryImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

type PropertyImageGalleryProps = {
  images: PropertyGalleryImage[];
  title: string;
};

export function PropertyImageGallery({ images, title }: PropertyImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const activeImage = images[activeIndex] ?? images[0];

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  if (!activeImage) return null;

  return (
    <>
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl border border-brand-beige/15 bg-brand-ink">
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="group relative block w-full cursor-zoom-in text-left"
            aria-label="Abrir imagem em tela cheia"
            title="Visualizar em tela cheia"
          >
            <img
              src={activeImage.url}
              alt={activeImage.altText ?? title}
              width={activeImage.width ?? 1600}
              height={activeImage.height ?? 900}
              fetchPriority="high"
              className="aspect-[16/9] max-h-[min(68vh,680px)] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-brand-ivory/25 bg-brand-ink/75 px-3 py-2 text-xs text-brand-ivory backdrop-blur-sm">
              <Maximize2 className="size-3.5" />
              Tela cheia
            </span>
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-brand-ivory/25 bg-brand-ink/75 text-brand-ivory backdrop-blur-sm transition hover:border-brand-gold hover:text-brand-gold"
                aria-label="Imagem anterior"
                title="Imagem anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-brand-ivory/25 bg-brand-ink/75 text-brand-ivory backdrop-blur-sm transition hover:border-brand-gold hover:text-brand-gold"
                aria-label="Próxima imagem"
                title="Próxima imagem"
              >
                <ChevronRight className="size-5" />
              </button>
              <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-brand-ivory/20 bg-brand-ink/75 px-3 py-1.5 text-xs text-brand-ivory backdrop-blur-sm">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Miniaturas da galeria">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative w-24 shrink-0 cursor-pointer overflow-hidden rounded-xl border bg-brand-ink transition sm:w-28 ${
                  index === activeIndex
                    ? "border-brand-gold ring-1 ring-brand-gold/60"
                    : "border-brand-beige/15 opacity-65 hover:border-brand-beige/45 hover:opacity-100"
                }`}
                aria-label={`Visualizar imagem ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
              >
                <img
                  src={image.url}
                  alt=""
                  width={image.width ?? 320}
                  height={image.height ?? 180}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isFullscreen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria de ${title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/95 p-4 backdrop-blur-md sm:p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsFullscreen(false);
          }}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 z-10 inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-brand-ivory/25 bg-brand-navy/80 text-brand-ivory transition hover:border-brand-gold hover:text-brand-gold"
            aria-label="Fechar tela cheia"
            title="Fechar"
          >
            <X className="size-5" />
          </button>

          <img
            src={activeImage.url}
            alt={activeImage.altText ?? title}
            width={activeImage.width ?? 1600}
            height={activeImage.height ?? 900}
            className="max-h-[90vh] max-w-[92vw] object-contain"
          />

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-brand-ivory/25 bg-brand-navy/80 text-brand-ivory transition hover:border-brand-gold hover:text-brand-gold sm:left-8"
                aria-label="Imagem anterior"
                title="Imagem anterior"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-brand-ivory/25 bg-brand-navy/80 text-brand-ivory transition hover:border-brand-gold hover:text-brand-gold sm:right-8"
                aria-label="Próxima imagem"
                title="Próxima imagem"
              >
                <ChevronRight className="size-6" />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-brand-ivory/20 bg-brand-navy/80 px-3 py-1.5 text-xs text-brand-ivory">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
