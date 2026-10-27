export type PublicPageAddress = {
  public_username: string;
  slug: string;
};

/** Use the page's saved address, never its owner's current display name. */
export function publicPagePath(page: PublicPageAddress) {
  return `/${encodeURIComponent(page.public_username)}/${encodeURIComponent(page.slug)}`;
}

export function publicPageUrl(page: PublicPageAddress, origin: string) {
  return `${origin.replace(/\/+$/, "")}${publicPagePath(page)}`;
}
