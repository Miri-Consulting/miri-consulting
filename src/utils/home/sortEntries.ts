export function sortByOrder<T extends { data: { order: number } }>(entries: T[]): T[] {
  return [...entries].sort((left, right) => left.data.order - right.data.order);
}
