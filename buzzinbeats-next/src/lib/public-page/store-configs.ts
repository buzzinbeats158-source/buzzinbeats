/**
 * Default per-store button colors, mirroring the $storeConfigs map in the
 * old classic_grid.blade.php partial. The Laravel page additionally
 * harmonized these with a per-creator `user_stores` settings table; that
 * table isn't wired into this Next.js app's data layer yet, so only the
 * built-in defaults are used here (see restoration report).
 */
export const STORE_CONFIGS: Record<string, { color: string; text: string }> = {
  amazon: { color: "#FF9900", text: "#FFFFFF" },
  flipkart: { color: "#2874F0", text: "#FFFFFF" },
  shopify: { color: "#95BF47", text: "#FFFFFF" },
  meesho: { color: "#F43397", text: "#FFFFFF" },
  etsy: { color: "#F1641E", text: "#FFFFFF" },
  walmart: { color: "#0071CE", text: "#FFFFFF" },
  ebay: { color: "#E53238", text: "#FFFFFF" },
  ajio: { color: "#2F4858", text: "#FFFFFF" },
  myntra: { color: "#FF3F6C", text: "#FFFFFF" },
};

export function storeConfigFor(storeName: string) {
  const key = storeName.trim().toLowerCase();
  return STORE_CONFIGS[key] ?? { color: "#0F172A", text: "#FFFFFF" };
}

/**
 * `products.store_platform` / `products.link` are stored as JSON-encoded
 * string arrays (see createProductAction/updateProductAction), but the old
 * Laravel data could also be a plain comma-separated string — same
 * defensive parsing as the blade partials.
 */
export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value !== "string" || value.trim() === "") return [];
  try {
    const decoded = JSON.parse(value);
    if (Array.isArray(decoded)) return decoded.map((v) => String(v).trim()).filter(Boolean);
  } catch {
    // not JSON — fall through to comma-splitting
  }
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
