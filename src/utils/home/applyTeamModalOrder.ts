const personModalMarker = '<div class="fs_modal-1_wrapper-2 people">';
const personNamePattern = /<h3 class="heading-style-h3">([^<]+)<\/h3>/;

export type OrderedTeamMember = {
  name: string;
};

export function applyTeamModalOrder(html: string, members: OrderedTeamMember[]): string {
  const parts = html.split(personModalMarker);

  if (parts.length < 2) {
    return html;
  }

  const firstPersonIndex = parts.findIndex(
    (part, index) => index > 0 && personNamePattern.test(part),
  );
  const lastPersonIndex = [...parts.keys()]
    .reverse()
    .find((index) => index > 0 && personNamePattern.test(parts[index]));

  if (firstPersonIndex === -1 || lastPersonIndex === undefined) {
    return html;
  }

  const personBlocks = new Map<string, string>();

  for (let index = firstPersonIndex; index <= lastPersonIndex; index += 1) {
    const name = parts[index].match(personNamePattern)?.[1];

    if (!name) {
      return html;
    }

    personBlocks.set(name, parts[index]);
  }

  if (personBlocks.size !== members.length || members.some((member) => !personBlocks.has(member.name))) {
    return html;
  }

  const orderedPersonParts = members.map((member) => personBlocks.get(member.name)!);

  return [
    ...parts.slice(0, firstPersonIndex),
    ...orderedPersonParts,
    ...parts.slice(lastPersonIndex + 1),
  ].join(personModalMarker);
}
