/** Extract unique tags from an array of objects with a `tags` field. */
export function extractTags(items: { tags: string[] }[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    for (const t of item.tags) set.add(t);
  }
  return [...set].sort();
}

/** Extract unique values from a specific string field. */
export function extractValues<T>(items: T[], key: keyof T): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const v = item[key];
    if (typeof v === "string" && v) set.add(v);
  }
  return [...set].sort();
}

/** Simple text search: returns true if any of the searchable fields contain the query. */
export function matchesQuery(
  query: string,
  ...fields: (string | string[])[]
): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return fields.some((f) => {
    if (Array.isArray(f)) return f.some((v) => v.toLowerCase().includes(q));
    return f.toLowerCase().includes(q);
  });
}
