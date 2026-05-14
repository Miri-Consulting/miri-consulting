const teamCardPattern =
  /<a fs-modal-element="open-\d+"[^>]*class="team8_item[^"]*"[\s\S]*?<\/a>/g;
const teamListMarker = '<div class="w-layout-grid team8_list">';

export type OrderedTeamMember = {
  name: string;
};

function extractTeamCardName(cardHtml: string): string | null {
  return cardHtml.match(/text-weight-semibold">([^<]+)<\/div>/)?.[1] ?? null;
}

export function applyTeamGridOrder(html: string, members: OrderedTeamMember[]): string {
  const listStart = html.indexOf(teamListMarker);

  if (listStart === -1) {
    return html;
  }

  const contentStart = listStart + teamListMarker.length;
  const listSection = html.slice(contentStart);
  const cards = Array.from(listSection.matchAll(teamCardPattern)).map((match) => match[0]);

  if (cards.length !== members.length) {
    return html;
  }

  const cardsByName = new Map<string, string>();

  for (const card of cards) {
    const name = extractTeamCardName(card);

    if (!name) {
      return html;
    }

    cardsByName.set(name, card);
  }

  const orderedCards = members.map((member) => cardsByName.get(member.name));

  if (orderedCards.some((card) => !card)) {
    return html;
  }

  const originalCards = cards.join('');
  const afterCards = html.slice(contentStart + originalCards.length);

  return html.slice(0, contentStart) + orderedCards.join('') + afterCards;
}
