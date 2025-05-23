// src/lib/slugify.ts

// Sua função continua aqui
export default function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Nova função para gerar slug seguro para arquivos GitHub
export function generateSafeSlug(title: string): string {
  const base = slugify(title)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${base}_${timestamp}`
}
