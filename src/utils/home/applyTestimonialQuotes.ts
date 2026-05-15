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
