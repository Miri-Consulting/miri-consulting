export const site = {
  name: 'Miri Consulting',
  title: 'Miri Consulting | Consulting Services for Landscape and Construction Companies',
  description:
    "Miri is a consulting company that helps landscape, construction, and snow removal companies customize and integrate Aspire, Buildertrend, Quickbooks, and other industry standard softwares. Our Teams specialize in project management, financial forecasting and month-end close, HR onboarding and counseling, and digital design assistance. We work with you directly to strategize solutions for your company's specific needs, and we continue to support you as you implement new systems and grow your business.",
  url: 'https://www.miri-consulting.com',
  ogImage: 'https://www.miri-consulting.com/media/og-image.png',
  splineScene: 'https://prod.spline.design/g1zcjk-5vLl2eWGi/scene.splinecode',
  splineSceneLocal: '/assets/spline/hero.scene.splinecode',
  joinTeamFormUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSeBoXrL-grJIQg5PPhon73buKD1aUytT0h6uwXAohbzVDcwlw/viewform?usp=sharing',
  webflowSiteId: '64f363b4ba0fc1362362824f',
  webflowHomePageId: '67cf44591eba6d97f960df05',
  webflowPrivacyPageId: '67f94c40dab2e5c3b96a8efd',
  webflowTermsPageId: '67f96117bb872567f22b2800',
  copyright: '© 2025 Miri. All rights reserved.',
} as const;

export const navLinks = [
  { href: 'index.html#about', label: 'About' },
  { href: 'index.html#industries', label: 'Industries' },
  { href: 'index.html#testimonials', label: 'Testimonials' },
  { href: 'index.html#services', label: 'Services' },
  { href: 'index.html#people', label: 'People' },
] as const;

export const cta = {
  calendlyUrl: 'https://calendly.com/ramelsanchez/chat',
  calendlyLegalUrl: 'https://calendly.com/ramel-miri/chat',
} as const;

export const analytics = {
  gtmId: 'GTM-N3PHMJQQ',
  gaMeasurementId: 'G-C1T2VCV7HD',
  crispWebsiteId: '7830bc37-7412-431c-9b07-904db9f2ba9a',
  cookieYesClientId: 'a9444bde0e91feb16b7f6557',
  clarityProjectId: 'qm79cyqx8h',
  facebookDomainVerification: 'mlk59ybu44651lzcbhhxjfl8vfae8q',
} as const;

export const vendor = {
  siteCss: '/styles/site.css',
  jquery: '/scripts/jquery.min.js',
  webfont: 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
  cookieYes: `https://cdn-cookieyes.com/client_data/${analytics.cookieYesClientId}/script.js`,
  finsweetModal: 'https://cdn.jsdelivr.net/npm/@finsweet/attributes-modal@1/modal.js',
  firstPartyTag: '/tracking/first-party',
  favicon: '/media/favicon.png',
  webclip: '/media/webclip.png',
} as const;
