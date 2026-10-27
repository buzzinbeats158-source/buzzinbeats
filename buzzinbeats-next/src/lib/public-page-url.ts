export type PublicPageAddress = {
  public_username: string;
  slug: string;
};

/** Use the page's saved address, never its owner's current display name. */
export function publicPagePath(page: PublicPageAddress) {
  if (typeof page.public_username !== "string" || !page.public_username || typeof page.slug !== "string" || !page.slug) {
    throw new Error("This page's permanent address is missing. Check that the permanent URL database migration has been applied.");
  }
  return `/${encodeURIComponent(page.public_username)}/${encodeURIComponent(page.slug)}`;
}

export function publicPageUrl(page: PublicPageAddress, origin: string) {
  return `${origin.replace(/\/+$/, "")}${publicPagePath(page)}`;
}
