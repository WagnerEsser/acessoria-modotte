import { sanitizeRichText } from "@/lib/rich-text";

type RichTextProps = {
  value: string | null | undefined;
  className?: string;
};

export function RichText({ value, className = "" }: RichTextProps) {
  const html = sanitizeRichText(value);

  if (!html) {
    return null;
  }

  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
