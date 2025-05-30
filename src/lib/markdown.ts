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

export function parseMarkdownFile(content: string, slug: string) {
  const { data, content: rawContent } = matter(content);

  return {
    slug,
    title: data.title || "Sem título",
    date: data.date || new Date().toISOString(),
    author: data.author || "Desconhecido",
    category: data.category || "Sem categoria",
    content: rawContent,
    excerpt: rawContent.split("\n").slice(0, 2).join(" "),
  };
}