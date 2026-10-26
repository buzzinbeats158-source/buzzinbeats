/**
 * Builds a public URL for a stored object path. Images/covers/QR-logos live
 * in the Cloudflare R2 public bucket, served via the assets.buzzinbeats.com
 * custom domain. Amazon-sourced product images are stored as their original
 * external URL (never duplicated into R2) — those pass through unchanged.
 */
export function publicStorageUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^(https?:\/\/|blob:|data:)/i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  return `${base}/${path}`;
}
