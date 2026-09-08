"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Eraser,
  Heading2,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";

import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  name: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const toolbar = [
  { label: "Negrito", icon: Bold, command: "bold" },
  { label: "Itálico", icon: Italic, command: "italic" },
  { label: "Sublinhado", icon: Underline, command: "underline" },
  { label: "Tachado", icon: Strikethrough, command: "strikeThrough" },
  { label: "Parágrafo", icon: Pilcrow, command: "formatParagraph" },
  { label: "Título 2", icon: Heading2, command: "formatH2" },
  { label: "Título 3", icon: Heading2, command: "formatH3" },
  { label: "Título 4", icon: Heading2, command: "formatH4" },
  { label: "Título 5", icon: Heading2, command: "formatH5" },
  { label: "Título 6", icon: Heading2, command: "formatH6" },
  { label: "Lista", icon: List, command: "insertUnorderedList" },
  { label: "Lista numerada", icon: ListOrdered, command: "insertOrderedList" },
  { label: "Citação", icon: Quote, command: "formatBlockquote" },
  { label: "Linha horizontal", icon: Minus, command: "insertHorizontalRule" },
  { label: "Link", icon: Link, command: "createLink" },
  { label: "Limpar formatação", icon: Eraser, command: "removeFormat" },
  { label: "Desfazer", icon: Undo2, command: "undo" },
  { label: "Refazer", icon: Redo2, command: "redo" },
] as const;

function executeCommand(command: (typeof toolbar)[number]["command"]) {
  if (command === "formatParagraph") {
    document.execCommand("formatBlock", false, "<p>");
  } else if (command === "formatH2") {
    document.execCommand("formatBlock", false, "<h2>");
  } else if (command === "formatH3") {
    document.execCommand("formatBlock", false, "<h3>");
  } else if (command === "formatH4") {
    document.execCommand("formatBlock", false, "<h4>");
  } else if (command === "formatH5") {
    document.execCommand("formatBlock", false, "<h5>");
  } else if (command === "formatH6") {
    document.execCommand("formatBlock", false, "<h6>");
  } else if (command === "formatBlockquote") {
    document.execCommand("formatBlock", false, "<blockquote>");
  } else if (command === "createLink") {
    const url = window.prompt("Endereço do link");
    if (url?.trim()) document.execCommand("createLink", false, url.trim());
  } else {
    document.execCommand(command, false);
  }
}

export function RichTextEditor({ name, value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== valueRef.current) {
      editorRef.current.innerHTML = value;
    }
    valueRef.current = value;
  }, [value]);

  function handleInput() {
    const nextValue = editorRef.current?.innerHTML ?? "";
    valueRef.current = nextValue;
    onChange?.(nextValue);
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-brand-beige/18 bg-brand-navy/55 shadow-sm", className)}>
      <div className="flex flex-wrap gap-1 border-b border-brand-beige/12 bg-brand-ivory/4 p-2" role="toolbar" aria-label="Formatação do texto">
        {toolbar.map(({ label, icon: Icon, command }) => (
          <button
            key={command}
            type="button"
            className="grid size-8 place-items-center rounded-lg text-brand-ivory/70 transition hover:bg-brand-ivory/10 hover:text-brand-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
            aria-label={label}
            title={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => executeCommand(command)}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={value} />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        className="min-h-40 w-full px-4 py-3 text-sm leading-7 text-brand-ivory outline-none empty:before:pointer-events-none empty:before:text-brand-ivory/42 empty:before:content-[attr(data-placeholder)]"
        onInput={handleInput}
      />
    </div>
  );
}
