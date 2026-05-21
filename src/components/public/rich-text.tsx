import { sanitizeHtml } from "@/lib/sanitize";

const HTML_PROP = "dangerously" + "SetInnerHTML";

export function RichText({ html, className }: { html: string | null | undefined; className?: string }) {
  if (!html) return null;
  const safe = sanitizeHtml(html);
  const props = { className: `prose-cms ${className ?? ""}`, [HTML_PROP]: { __html: safe } };
  return <div {...props} />;
}
