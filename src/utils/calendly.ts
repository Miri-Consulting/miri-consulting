import { cta } from '../data/site';

/** Historical default in Webflow-export partials; replaced by {@link syncPrimaryCalendlyUrl}. */
const LEGACY_PRIMARY_CALENDLY = 'https://calendly.com/ramelsanchez/chat';

/** Safe for use inside `onclick='…'` (single-quoted HTML attribute). */
export function calendlyPopupOnclick(calendlyUrl: string): string {
  return `Calendly.initPopupWidget({url: ${JSON.stringify(calendlyUrl)}});return false;`;
}

/** Rewrites hardcoded primary Calendly URLs to `cta.calendlyUrl` (href and `initPopupWidget` payloads). */
export function syncPrimaryCalendlyUrl(
  html: string,
  calendlyUrl: string = cta.calendlyUrl,
): string {
  return html.replaceAll(LEGACY_PRIMARY_CALENDLY, calendlyUrl);
}

/**
 * Adds an inline Calendly popup handler to `<a href="…calendly…">` tags that do not already call
 * `Calendly.initPopupWidget`. Uses a single-quoted `onclick` so JSON-stringified URLs stay valid.
 */
export function addCalendlyPopupToPlainPrimaryAnchors(
  html: string,
  calendlyUrl: string = cta.calendlyUrl,
): string {
  const escaped = calendlyUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<a([^>]*?)href="${escaped}"([^>]*?)>`, 'gi');
  return html.replace(re, (_full, before: string, after: string) => {
    const attrs = `${before}href="${calendlyUrl}"${after}`;
    if (/initPopupWidget/i.test(attrs)) {
      return `<a${before}href="${calendlyUrl}"${after}>`;
    }
    return `<a${before}href="${calendlyUrl}" onclick='${calendlyPopupOnclick(calendlyUrl)}'${after}>`;
  });
}
