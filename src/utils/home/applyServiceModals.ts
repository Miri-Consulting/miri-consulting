const modalBlockPattern =
  /<div[^>]*class="layout507_card-content-top"[^>]*><div class="margin-bottom margin-small"><h2 class="heading-style-h3">([\s\S]*?)<\/h2><\/div><p class="text-size-medium-smallspace text-color-grey">([\s\S]*?)<\/p><\/div>/g;

const imageWrapperOpen = '<div class="layout507_image-wrapper">';
const imageWrapperCloseToken = '</div>';

export function applyServiceModals(
  html: string,
  modals: Array<{
    heading: string;
    subheading: string;
    modalImage: string;
    modalImageAlt: string;
  }>,
): string {
  const marker = 'id="services"';
  const start = html.indexOf(marker);

  if (start === -1) {
    return html;
  }

  const before = html.slice(0, start);
  const section = html.slice(start);
  const matches = Array.from(section.matchAll(modalBlockPattern));

  if (matches.length === 0 || matches.length !== modals.length) {
    return html;
  }

  let index = 0;
  const withHeadings = section.replace(modalBlockPattern, (match, currentHeading: string, currentSubheading: string) => {
    const next = modals[index];
    index += 1;

    if (!next || (next.heading === currentHeading && next.subheading === currentSubheading)) {
      return match;
    }

    const opening = match.slice(0, match.indexOf('<h2 class="heading-style-h3">'));

    return `${opening}<h2 class="heading-style-h3">${next.heading}</h2></div><p class="text-size-medium-smallspace text-color-grey">${next.subheading}</p></div>`;
  });

  return before + replaceModalImages(withHeadings, modals);
}

function replaceModalImages(
  section: string,
  modals: Array<{ modalImage: string; modalImageAlt: string }>,
): string {
  let cursor = 0;
  let result = '';

  for (const modal of modals) {
    const h2Pos = section.indexOf('<h2 class="heading-style-h3">', cursor);
    if (h2Pos === -1) {
      break;
    }

    const wrapperStart = section.indexOf(imageWrapperOpen, h2Pos);
    if (wrapperStart === -1) {
      break;
    }

    const innerStart = wrapperStart + imageWrapperOpen.length;
    const wrapperClose = section.indexOf(imageWrapperCloseToken, innerStart);
    if (wrapperClose === -1) {
      break;
    }

    const wrapperEnd = wrapperClose + imageWrapperCloseToken.length;
    const replacement = `${imageWrapperOpen}<img src="${modal.modalImage}" alt="${modal.modalImageAlt}" loading="lazy" class="layout507_image"/>${imageWrapperCloseToken}`;

    result += section.slice(cursor, wrapperStart) + replacement;
    cursor = wrapperEnd;
  }

  return result + section.slice(cursor);
}
