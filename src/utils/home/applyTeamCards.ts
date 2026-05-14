function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function applyTeamCards(
  html: string,
  members: Array<{ name: string; roleLabel: string }>,
): string {
  let result = html;

  for (const member of members) {
    const rolePattern = new RegExp(
      `(<div class="text-size-small text-weight-semibold">${escapeRegExp(member.name)}</div></div><div class="text-size-tiny">)([\\s\\S]*?)(</div>)`,
    );
    const encodedRole = escapeHtml(member.roleLabel);

    result = result.replace(rolePattern, (match, prefix: string, currentRole: string, suffix: string) => {
      if (currentRole === encodedRole) {
        return match;
      }

      return `${prefix}${encodedRole}${suffix}`;
    });
  }

  return result;
}
