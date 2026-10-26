import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "a"];

/** Marker styles selectable per list item from the editor's "List Style" dropdown. */
export const LIST_MARKER_STYLES = [
  "check",
  "green-check",
  "red-cross",
  "arrow",
  "star",
  "circle-number",
  "plain-numbered",
] as const;

const LIST_MARKER_STYLE_SET: Set<string> = new Set(LIST_MARKER_STYLES);

function keepAllowedMarker(tagName: string, attribs: Record<string, string>) {
  const marker = attribs["data-marker"];
  const attribsOut: Record<string, string> = {};
  if (marker && LIST_MARKER_STYLE_SET.has(marker)) attribsOut["data-marker"] = marker;
  return { tagName, attribs: attribsOut };
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: { a: ["href", "target", "rel"], li: ["data-marker"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer nofollow" }),
    li: keepAllowedMarker,
  },
  exclusiveFilter: (frame) => (frame.tag === "p" || frame.tag === "li") && !frame.text.trim(),
};

/** Sanitizes editor-produced HTML down to the small allowlist the redirect-link description supports. */
export function sanitizeDescriptionHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS).trim();
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Legacy rows stored plain text (possibly with newlines). Turn that into paragraph/line-break HTML. */
function legacyPlainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const LOOKS_LIKE_HTML = /<\/?[a-z][\s\S]*>/i;

/**
 * Normalizes a stored description (either legacy plain text or already-HTML from the
 * rich-text editor) into sanitized HTML safe to render or to load back into the editor.
 */
export function normalizeDescriptionToHtml(raw: string | null | undefined): string {
  if (!raw) return "";
  const html = LOOKS_LIKE_HTML.test(raw) ? raw : legacyPlainTextToHtml(raw);
  return sanitizeDescriptionHtml(html);
}
