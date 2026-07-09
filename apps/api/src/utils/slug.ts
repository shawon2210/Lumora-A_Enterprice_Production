export function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 200) || 'untitled'
  );
}

export function makeUniqueSlug(slug: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slug}-${suffix}`;
}
