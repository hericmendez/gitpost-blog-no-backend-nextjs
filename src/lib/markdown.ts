// src/lib/markdown.ts
import matter from 'gray-matter'

export function createMarkdown(frontmatter: Record<string, any>, content: string) {
  return matter.stringify(content, frontmatter)
}
