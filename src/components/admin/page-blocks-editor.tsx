"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type EditableBlock = {
  blockKey: string;
  title: string;
  content: string;
};

type PageBlocksEditorProps = {
  initialBlocks: EditableBlock[];
  label: string;
  contentLabel?: string;
  addLabel: string;
  emptyLabel: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export function PageBlocksEditor({
  initialBlocks,
  label,
  contentLabel = "Descrição",
  addLabel,
  emptyLabel,
}: PageBlocksEditorProps) {
  const [blocks, setBlocks] = useState<EditableBlock[]>(initialBlocks);

  function updateBlock(index: number, field: keyof EditableBlock, value: string) {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? { ...block, [field]: value } : block,
      ),
    );
  }

  function addBlock() {
    setBlocks((current) => {
      const nextNumber = current.length + 1;
      const baseKey = slugify(`${label}-${nextNumber}`) || `bloco-${nextNumber}`;
      let blockKey = baseKey;
      let suffix = 2;

      while (current.some((block) => block.blockKey === blockKey)) {
        blockKey = `${baseKey}-${suffix}`;
        suffix += 1;
      }

      return [...current, { blockKey, title: "", content: "" }];
    });
  }

  return (
    <div className="space-y-4">
      {blocks.length ? (
        blocks.map((block, index) => (
          <div
            key={`${block.blockKey}-${index}`}
            className="space-y-3 rounded-2xl border border-brand-beige/10 bg-brand-ivory/4 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                {label} {index + 1}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBlocks((current) => current.filter((_, blockIndex) => blockIndex !== index))}
              >
                Remover
              </Button>
            </div>
            <input type="hidden" name={`block_${index + 1}_key`} value={block.blockKey} />
            <Input
              name={`block_${index + 1}_title`}
              value={block.title}
              onChange={(event) => updateBlock(index, "title", event.target.value)}
              placeholder={`Título de ${label.toLowerCase()}`}
            />
            <Textarea
              name={`block_${index + 1}_content`}
              value={block.content}
              onChange={(event) => updateBlock(index, "content", event.target.value)}
              rows={4}
              placeholder={contentLabel}
            />
          </div>
        ))
      ) : (
        <p className="rounded-2xl border border-dashed border-brand-beige/15 p-5 text-sm text-brand-ivory/60">
          {emptyLabel}
        </p>
      )}
      <Button type="button" variant="outline" onClick={addBlock}>
        {addLabel}
      </Button>
    </div>
  );
}
