/**
 * Prefixes Astro `base` onto a root-absolute path so static files resolve on
 * GitHub Pages project sites (`https://user.github.io/repo/`).
 */
export function rootPath(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = import.meta.env.BASE_URL;
  if (base === '/') {
    return normalized;
  }
  return `${base.replace(/\/$/, '')}${normalized}`;
}

export function homeAnchorPath(anchor: string): string {
  return rootPath(`/#${anchor.replace(/^#/, '')}`);
}

export function localOrHomeAnchorPath(anchor: string, local: boolean): string {
  const normalized = `#${anchor.replace(/^#/, '')}`;
  return local ? normalized : homeAnchorPath(normalized);
}
