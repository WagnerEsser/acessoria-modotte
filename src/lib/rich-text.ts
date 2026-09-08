const allowedTags = new Set([
  "p",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "br",
  "hr",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "div",
]);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHref(value: string) {
  const href = value.trim();

  return /^(https?:|mailto:|tel:)/i.test(href) ? href : null;
}

export function sanitizeRichText(value: string | null | undefined) {
  const source = value?.trim() ?? "";

  if (!source) {
    return "";
  }

  if (!/<[a-z][\s\S]*>/i.test(source)) {
    return escapeHtml(source).replace(/\r?\n/g, "<br />");
  }

  const withoutUnsafeBlocks = source
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/<(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, "");

  return withoutUnsafeBlocks.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (tag, name: string, attributes: string) => {
    const normalizedName = name.toLowerCase();

    if (!allowedTags.has(normalizedName)) {
      return "";
    }

    if (tag.startsWith("</")) {
      return `</${normalizedName}>`;
    }

    if (normalizedName === "br" || normalizedName === "hr") {
      return `<${normalizedName} />`;
    }

    if (normalizedName === "a") {
      const hrefMatch = /\bhref\s*=\s*["']([^"']*)["']/i.exec(attributes);
      const href = hrefMatch ? safeHref(hrefMatch[1]) : null;

      return href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">`
        : "";
    }

    return `<${normalizedName}>`;
  });
}

export function richTextToPlainText(value: string | null | undefined) {
  const source = value?.trim() ?? "";

  if (!source) {
    return "";
  }

  return source
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<\/(p|h[2-6]|li|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
