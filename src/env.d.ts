/** Globals defined by the inline analytics bootstrap in HeadAnalytics.astro. */
interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
}
