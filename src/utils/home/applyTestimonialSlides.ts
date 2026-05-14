import { testimonialQuotesForSlider } from './applyTestimonialQuotes';

export type TestimonialSlide = {
  quote: string;
  name: string;
  title: string;
  portraitSrc: string;
  portraitAlt: string;
};

function extendSlidesToTen(slides: TestimonialSlide[]): TestimonialSlide[] {
  if (slides.length === 0) {
    return [];
  }

  const extended: TestimonialSlide[] = [...slides];

  while (extended.length < 10) {
    extended.push(slides[extended.length % slides.length]);
  }

  return extended.slice(0, 10);
}

export function applyTestimonialSlides(
  html: string,
  slides: TestimonialSlide[],
): string {
  const marker = 'class="testimonial23_slider';
  const start = html.indexOf(marker);

  if (start === -1 || slides.length === 0) {
    return html;
  }

  const slideQuotes = testimonialQuotesForSlider(slides.map((slide) => slide.quote));
  const slideDetails = extendSlidesToTen(slides);
  let quoteIndex = 0;
  let portraitIndex = 0;
  let clientIndex = 0;

  const before = html.slice(0, start);
  const section = html.slice(start);

  const withQuotes = section.replace(
    /<div class="text-size-medium">([\s\S]*?)<\/div>/g,
    (match, currentQuote: string) => {
      if (quoteIndex >= slideQuotes.length) {
        return match;
      }

      const nextQuote = slideQuotes[quoteIndex];
      quoteIndex += 1;

      if (!nextQuote || nextQuote === currentQuote) {
        return match;
      }

      return `<div class="text-size-medium">${nextQuote}</div>`;
    },
  );

  const withPortraits = withQuotes.replace(
    /(<img[^>]*class="testimonial23_customer-image"[^>]*src=")([^"]+)("[^>]*>)/g,
    (match, prefix: string, currentSrc: string, suffix: string) => {
      if (portraitIndex >= slideDetails.length) {
        return match;
      }

      const next = slideDetails[portraitIndex];
      portraitIndex += 1;

      if (!next || currentSrc === next.portraitSrc) {
        return match;
      }

      const withAlt = suffix.includes('alt=')
        ? suffix.replace(/alt="[^"]*"/, `alt="${next.portraitAlt}"`)
        : ` alt="${next.portraitAlt}"${suffix}`;

      return `${prefix}${next.portraitSrc}${withAlt}`;
    },
  );

  const withClients = withPortraits.replace(
    /<div class="testimonial23_client-info"><div class="text-weight-semibold"><strong>([^<]*)<\/strong><\/div><div>([^<]*)<\/div><\/div>/g,
    (match, currentName: string, currentTitle: string) => {
      if (clientIndex >= slideDetails.length) {
        return match;
      }

      const next = slideDetails[clientIndex];
      clientIndex += 1;

      if (!next || (currentName === next.name && currentTitle === next.title)) {
        return match;
      }

      return `<div class="testimonial23_client-info"><div class="text-weight-semibold"><strong>${next.name}</strong></div><div>${next.title}</div></div>`;
    },
  );

  return before + withClients;
}
