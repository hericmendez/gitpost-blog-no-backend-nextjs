// src/lib/markdown.ts
import matter from 'gray-matter'

export function createMarkdown(frontmatter: Record<string, any>, content: string) {
  const clean = Object.fromEntries(
    Object.entries(frontmatter).map(([k, v]) => [
      k,
      typeof v === "string" ? v.replace(/^['"]+|['"]+$/g, "") : v,
    ])
  );
  return matter.stringify(content, clean);
}
