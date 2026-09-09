"use client";

import { Film, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";

export type ManagedPropertyVideo = {
  id: string;
  url: string;
  fileName: string | null;
  mimeType: string;
  sizeBytes: number;
  sortOrder: number;
};

type PropertyVideoManagerProps = {
  initialVideos?: ManagedPropertyVideo[];
};

export function PropertyVideoManager({ initialVideos = [] }: PropertyVideoManagerProps) {
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const visibleVideos = useMemo(
    () => initialVideos.filter((video) => !removedIds.includes(video.id)),
    [initialVideos, removedIds],
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFiles(Array.from(event.target.files ?? []));
  }

  return (
    <section className="space-y-4 rounded-3xl border border-brand-beige/12 bg-brand-ivory/4 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Vídeos</p>
        <h2 className="mt-2 font-display text-2xl text-brand-ivory">Vídeos do imóvel</h2>
        <p className="mt-2 text-sm leading-6 text-brand-ivory/68">
          Adicione até 3 vídeos MP4, MOV, WebM ou OGG, com no máximo 50 MB cada.
        </p>
      </div>

      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-gold/35 bg-brand-navy/40 px-4 py-5 text-center transition hover:border-brand-gold/65 hover:bg-brand-navy/65">
        <Upload className="size-5 text-brand-gold" />
        <span className="text-sm text-brand-ivory">Selecionar vídeos</span>
        <span className="text-xs text-brand-ivory/55">Você pode selecionar até três de uma vez</span>
        <input
          name="videos"
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/ogg"
          multiple
          onChange={handleFileChange}
          className="sr-only"
        />
      </label>

      {selectedFiles.length ? (
        <div className="space-y-2">
          <p className="text-sm text-brand-ivory/72">
            {selectedFiles.length} {selectedFiles.length === 1 ? "vídeo selecionado" : "vídeos selecionados"} para enviar.
          </p>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {selectedFiles.map((file) => (
              <div key={`${file.name}-${file.lastModified}`} className="flex min-w-0 items-center gap-2 rounded-xl border border-brand-gold/20 bg-brand-navy/45 px-3 py-2 text-xs text-brand-ivory/68">
                <Film className="size-4 shrink-0 text-brand-gold" />
                <span className="truncate">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {visibleVideos.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleVideos.map((video) => (
            <div key={video.id} className="flex items-center justify-between gap-3 rounded-2xl border border-brand-beige/12 bg-brand-navy/55 p-3">
              <span className="flex min-w-0 items-center gap-2 text-xs text-brand-ivory/68">
                <Film className="size-4 shrink-0 text-brand-gold" />
                <span className="truncate">{video.fileName ?? "Vídeo do imóvel"}</span>
              </span>
              <button
                type="button"
                onClick={() => setRemovedIds((current) => current.includes(video.id) ? current : [...current, video.id])}
                className="inline-flex shrink-0 cursor-pointer items-center text-brand-ivory/58 transition hover:text-red-200"
                aria-label={`Remover vídeo ${video.fileName ?? "do imóvel"}`}
                title="Remover vídeo"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {removedIds.length ? (
        <div className="space-y-2 rounded-2xl border border-red-300/20 bg-red-950/15 p-3 text-sm text-brand-ivory/72">
          <p>Os vídeos removidos serão excluídos ao salvar.</p>
          {initialVideos.filter((video) => removedIds.includes(video.id)).map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setRemovedIds((current) => current.filter((id) => id !== video.id))}
              className="mr-3 cursor-pointer text-xs text-brand-gold underline underline-offset-4"
            >
              Restaurar {video.fileName ?? "vídeo"}
            </button>
          ))}
        </div>
      ) : null}

      {removedIds.map((id) => <input key={id} type="hidden" name="delete_video_ids" value={id} />)}
    </section>
  );
}
