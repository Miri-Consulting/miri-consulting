export const site = {
  name: 'Miri Consulting',
  title: 'Miri Consulting | Consulting Services for Landscape and Construction Companies',
  description:
    "Miri is a consulting company that helps landscape, construction, and snow removal companies customize and integrate Aspire, Buildertrend, Quickbooks, and other industry standard softwares. Our Teams specialize in project management, financial forecasting and month-end close, HR onboarding and counseling, and digital design assistance. We work with you directly to strategize solutions for your company's specific needs, and we continue to support you as you implement new systems and grow your business.",
  url: 'https://www.miri-consulting.com',
  ogImage: 'https://www.miri-consulting.com/media/og-image.png',
  splineSceneLocal: '/assets/spline/hero.scene.splinecode',
  joinTeamFormUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSeBoXrL-grJIQg5PPhon73buKD1aUytT0h6uwXAohbzVDcwlw/viewform?usp=sharing',
  copyright: '© 2025 Miri. All rights reserved.',
} as const;

export const navLinks = [
  { anchor: 'about', label: 'About' },
  { anchor: 'industries', label: 'Industries' },
  { anchor: 'testimonials', label: 'Testimonials' },
  { anchor: 'services', label: 'Services' },
  { anchor: 'people', label: 'People' },
] as const;
export const cta = {
  calendlyUrl: 'https://calendly.com/ramelsanchez/chat',
} as const;

export const analytics = {
  gtmId: 'GTM-N3PHMJQQ',
  gaMeasurementId: 'G-C1T2VCV7HD',
  crispWebsiteId: '7830bc37-7412-431c-9b07-904db9f2ba9a',
  cookieYesClientId: 'a9444bde0e91feb16b7f6557',
  clarityProjectId: 'qm79cyqx8h',
  facebookDomainVerification: 'mlk59ybu44651lzcbhhxjfl8vfae8q',
} as const;

/** Webflow export IDs — required for IX2 (navbar menu) and page-scoped interactions. */
export const webflow = {
  siteId: '64f363b4ba0fc1362362824f',
  domain: 'www.miri-consulting.com',
  pages: {
    home: '67cf44591eba6d97f960df05',
    privacy: '67f94c40dab2e5c3b96a8efd',
    terms: '67f96117bb872567f22b2800',
  },
  navInteractionId: {
    home: '48410a7f-9d6d-9f18-2a4c-2f70603fdcfe',
    legal: '019cc202-3501-62e0-9424-94423a0fbe04',
  },
} as const;

export const vendor = {
  siteCss: '/styles/site.css',
  jquery: '/scripts/jquery.min.js',
  webfont: 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
  cookieYes: `https://cdn-cookieyes.com/client_data/${analytics.cookieYesClientId}/script.js`,
  finsweetModal: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes-modal@1/modal.js',
  favicon: '/media/favicon.png',
  webclip: '/media/webclip.png',
} as const;
