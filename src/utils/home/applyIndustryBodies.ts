const bodyPattern =
  /<p class="text-size-small text-color-grey">([\s\S]*?)<\/p>/g;

export function applyIndustryBodies(html: string, bodies: string[]): string {
  const marker = 'id="industries"';
  const start = html.indexOf(marker);

  if (start === -1) {
    return html;
  }

  const section = html.slice(start);
  const matches = [...section.matchAll(bodyPattern)];

  if (matches.length === 0 || matches.length !== bodies.length) {
    return html;
  }

  let index = 0;

  const after = section.replace(bodyPattern, (match, currentBody: string) => {
    const nextBody = bodies[index];
    index += 1;

    if (!nextBody || nextBody === currentBody) {
      return match;
    }

    return `<p class="text-size-small text-color-grey">${nextBody}</p>`;
  });

  return html.slice(0, start) + after;
}
