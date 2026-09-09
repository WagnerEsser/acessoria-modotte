"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  Bold,
  Eraser,
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
  label?: ReactNode;
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
  { label: "Título H2", text: "H2", command: "formatH2" },
  { label: "Título H3", text: "H3", command: "formatH3" },
  { label: "Título H4", text: "H4", command: "formatH4" },
  { label: "Título H5", text: "H5", command: "formatH5" },
  { label: "Título H6", text: "H6", command: "formatH6" },
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

export function RichTextEditor({ name, value, label, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = value;
    }
  }, [value]);

  function handleInput() {
    const nextValue = editorRef.current?.innerHTML ?? "";
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = nextValue;
    }
    onChange?.(nextValue);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <span className="ml-1 block text-[13px] text-brand-ivory/78">{label}</span> : null}
      <div className="overflow-hidden rounded-2xl border border-brand-beige/18 bg-brand-navy/55 shadow-sm">
        <div className="flex flex-wrap gap-1 border-b border-brand-beige/12 bg-brand-ivory/4 p-2" role="toolbar" aria-label="Formatação do texto">
        {toolbar.map((item) => {
          const Icon = "icon" in item ? item.icon : null;
          const text = "text" in item ? item.text : null;

          return (
            <button
              key={item.command}
              type="button"
              className="grid size-8 place-items-center rounded-lg text-brand-ivory/70 transition hover:bg-brand-ivory/10 hover:text-brand-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
              aria-label={item.label}
              title={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => executeCommand(item.command)}
            >
              {text ? (
                <span className="text-[10px] font-semibold leading-none" aria-hidden="true">
                  {text}
                </span>
              ) : Icon ? (
                <Icon className="size-4" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
        </div>
        <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={value} />
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-rich-text-name={name}
          data-placeholder={placeholder}
          className="rich-text min-h-40 w-full px-4 py-3 outline-none empty:before:pointer-events-none empty:before:text-brand-ivory/42 empty:before:content-[attr(data-placeholder)]"
          onInput={handleInput}
        />
      </div>
    </div>
  );
}
