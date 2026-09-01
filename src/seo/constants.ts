// Shared SEO constants and helpers to avoid duplication across pageMeta.ts and JsonLd.tsx.

/** Base site URL — no trailing slash. */
export const SITE_URL = "https://ahmadmdabit.github.io";

/** OpenGraph image path (without cache-busting query). */
export const OG_IMAGE = `${SITE_URL}/PersonalPhoto.png`;

/**
 * Returns the OG image URL with conditional cache-busting.
 * Only appends `?v=` when VITE_ASSET_HASH is defined and non-empty.
 */
export function getOgImage(): string {
  const hash = import.meta.env.VITE_ASSET_HASH;
  return hash ? `${OG_IMAGE}?v=${hash}` : OG_IMAGE;
}
