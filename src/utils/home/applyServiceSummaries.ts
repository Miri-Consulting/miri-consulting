const headingPattern = /<h3 class="heading-style-h3">([\s\S]*?)<\/h3>/g;
const bodyPattern = /<p class="text-size-medium text-color-grey">([\s\S]*?)<\/p>/g;
const imageWrapperPattern = /<div class="layout507_image-wrapper">[\s\S]*?<\/div>/g;

export function applyServiceSummaries(
  html: string,
  cards: Array<{
    heading: string;
    body: string;
    cardImage: string;
    cardImageAlt: string;
  }>,
): string {
  const tabsMarker = 'class="layout507_tabs w-tabs"';
  const tabsStart = html.indexOf(tabsMarker);

  if (tabsStart === -1) {
    return html;
  }

  const contentStart = html.indexOf('w-tab-content', tabsStart);
  const contentEnd = html.indexOf('fs_modal-1_popup-2', contentStart);

  if (contentStart === -1 || contentEnd === -1) {
    return html;
  }

  const before = html.slice(0, contentStart);
  const section = html.slice(contentStart, contentEnd);
  const after = html.slice(contentEnd);
  const headings = [...section.matchAll(headingPattern)];
  const bodies = [...section.matchAll(bodyPattern)];
  const images = [...section.matchAll(imageWrapperPattern)];

  if (
    headings.length !== cards.length ||
    bodies.length !== cards.length ||
    images.length !== cards.length
  ) {
    return html;
  }

  let headingIndex = 0;
  let bodyIndex = 0;
  let imageIndex = 0;

  const updated = section
    .replace(headingPattern, (match, currentHeading: string) => {
      const next = cards[headingIndex];
      headingIndex += 1;

      if (!next || next.heading === currentHeading) {
        return match;
      }

      return `<h3 class="heading-style-h3">${next.heading}</h3>`;
    })
    .replace(bodyPattern, (match, currentBody: string) => {
      const next = cards[bodyIndex];
      bodyIndex += 1;

      if (!next || next.body === currentBody) {
        return match;
      }

      return `<p class="text-size-medium text-color-grey">${next.body}</p>`;
    })
    .replace(imageWrapperPattern, (match) => {
      const next = cards[imageIndex];
      imageIndex += 1;

      if (!next) {
        return match;
      }

      return `<div class="layout507_image-wrapper"><img src="${next.cardImage}" alt="${next.cardImageAlt}" loading="lazy" class="layout507_image"/></div>`;
    });

  return before + updated + after;
}
