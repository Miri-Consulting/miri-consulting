import { escapeRegExp } from './escapeRegExp';

export type TeamModalHeadshot = {
  name: string;
  src: string;
  alt: string;
};

export function applyTeamModalHeadshots(
  html: string,
  members: TeamModalHeadshot[],
): string {
  let result = html;

  for (const member of members) {
    // The `[\s\S]` body uses a negative lookahead so the lazy match cannot span
    // past another `<div class="layout507_image-wrapper">`. Without that bound
    // the regex would greedily pair the *first* image-wrapper in the document
    // (the Operations card slot in the tabs section) with each team member's
    // h3, overwriting the same slot on every iteration.
    const pattern = new RegExp(
      `(<div class="layout507_image-wrapper"><img[^>]*src=")([^"]+)("[^>]*>(?:(?!<div class="layout507_image-wrapper">)[\\s\\S])*?<h3 class="heading-style-h3">${escapeRegExp(member.name)}</h3>)`,
    );

    result = result.replace(pattern, (match, prefix: string, currentSrc: string, suffix: string) => {
      if (currentSrc === member.src) {
        return match;
      }

      const withAlt = suffix.replace(/alt="[^"]*"/, `alt="${member.alt}"`);

      return `${prefix}${member.src}${withAlt}`;
    });
  }

  return result;
}
