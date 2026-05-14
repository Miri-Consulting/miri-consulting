export function testimonialQuotesForSlider(
  quotes: string[],
): string[] {
  if (quotes.length === 0) {
    return [];
  }

  const extended = [...quotes];

  while (extended.length < 10) {
    extended.push(quotes[extended.length % quotes.length]);
  }

  return extended.slice(0, 10);
}

export function applyTestimonialQuotes(html: string, quotes: string[]): string {
  const marker = 'class="testimonial23_slider';
  const start = html.indexOf(marker);

  if (start === -1) {
    return html;
  }

  const slideQuotes = testimonialQuotesForSlider(quotes);
  let index = 0;

  const before = html.slice(0, start);
  const after = html.slice(start).replace(
    /<div class="text-size-medium">([\s\S]*?)<\/div>/g,
    (match, currentQuote: string) => {
      if (index >= slideQuotes.length) {
        return match;
      }

      const nextQuote = slideQuotes[index];
      index += 1;

      if (!nextQuote || nextQuote === currentQuote) {
        return match;
      }

      return `<div class="text-size-medium">${nextQuote}</div>`;
    },
  );

  return before + after;
}
