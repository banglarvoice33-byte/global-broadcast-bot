export const SITE_URL = "https://global-broadcast-bot.lovable.app";
export const SITE_NAME_BN = "বাংলার ভয়েস";
export const SITE_NAME_EN = "Banglar Voice";
export const SITE_TAGLINE_BN = "২৪/৭ এআই অটোমেটেড সংবাদমাধ্যম";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
