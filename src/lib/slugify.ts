// src/lib/slugify.ts
export default function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }
  