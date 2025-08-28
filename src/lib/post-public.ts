// lib/posts-public.ts
import 'server-only';

const GH_TOKEN = process.env.GITHUB_APP_TOKEN!;
const DEFAULT_OWNER = process.env.GITHUB_REPO_OWNER || '';

type PostSummary = {
  slug: string;
  title: string;
  author?: string;
  category?: string;
  date?: string;
  excerpt?: string;
};


function splitFrontmatter(content: string): { metaRaw: string; body: string } {
  // frontmatter no topo do arquivo:
  // ---
  // key: value
  // ---
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) {
    // sem FM: devolve corpo inteiro (trim opcional)
    return { metaRaw: '', body: content.trimStart() };
  }
  const metaRaw = m[1] ?? '';
  const body = content.slice(m[0].length).trimStart();
  return { metaRaw, body };
}

function coerceOwner(owner?: string) {
  return (owner && owner.trim()) || DEFAULT_OWNER;
}



function parseFrontmatter(content: string, slug: string): PostSummary {
  const { metaRaw, body } = splitFrontmatter(content);

  const meta: Record<string, string> = {};
  if (metaRaw) {
    metaRaw.split('\n').forEach((line) => {
      if (!line.trim()) return;
      const [key, ...rest] = line.split(':');
      meta[key.trim()] = (rest.join(':') || '').trim().replace(/^["']|["']$/g, '');
    });
  }

  const excerpt = body.split('\n').find((l) => l.trim())?.slice(0, 200) || '';

  return {
    slug,
    title: meta.title || slug,
    author: meta.author,
    category: meta.category,
    date: meta.date,
    excerpt,
  };
}
export async function listPostsPublic(ownerParam?: string): Promise<PostSummary[]> {
  const owner = coerceOwner(ownerParam);
  if (!owner) throw new Error('Owner não definido');
  const repo = `${owner}/git-posts`;

  // Lista de arquivos na pasta /posts
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/posts`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${GH_TOKEN}`,
    },
    // Cacheia por 5 minutos e marca com tag para invalidação
    // next: { revalidate: 300, tags: [`posts:${repo}`] },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub falhou (${res.status}): ${text}`);
  }

  const files: any[] = await res.json();

  const mdFiles = files.filter((f) => f.type === 'file' && f.name.endsWith('.md'));

  const posts = await Promise.all(
    mdFiles.map(async (f) => {
      const raw = await fetch(f.download_url);
      const content = await raw.text();
      const slug = f.name.replace(/\.md$/, '');
      return parseFrontmatter(content, slug);
    })
  );

  // Ordena por data desc se existir; senão por slug
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.slug.localeCompare(a.slug));
  return posts;
}

export async function getPostPublic(slug: string, ownerParam?: string) {
  const owner = coerceOwner(ownerParam);
  if (!owner) throw new Error('Owner não definido');
  const repo = `${owner}/git-posts`;

  const raw = await fetch(
    `https://raw.githubusercontent.com/${repo}/main/posts/${encodeURIComponent(slug)}.md`
  );

  if (raw.status === 404) return null;
  if (!raw.ok) throw new Error(`Erro ao baixar post (${raw.status})`);

  const content = await raw.text();

  // 👇 usa o mesmo helper p/ remover frontmatter
  const { body } = splitFrontmatter(content);
  const meta = parseFrontmatter(content, slug);

  return {
    ...meta,
    content: body, // 👈 agora vem só o corpo do texto, sem metadados
  };
}

export async function listCategoriesPublic(ownerParam?: string): Promise<string[]> {
  const posts = await listPostsPublic(ownerParam);

  // dedupe case-insensitive preservando a 1ª grafia encontrada
  const map = new Map<string, string>();
  const add = (name: string) => {
    const key = name.trim();
    if (!key) return;
    const low = key.toLowerCase();
    if (!map.has(low)) map.set(low, key);
  };

  for (const p of posts) {
    const raw: unknown = (p as any).categories ?? (p as any).category;
    if (!raw) continue;

    if (Array.isArray(raw)) {
      for (const c of raw) if (typeof c === 'string') add(c);
    } else if (typeof raw === 'string') {
      // suporta "Dev, Backend" ou "Dev"
      raw.split(',').forEach((c) => add(c));
    }
  }

  // ordena alfabeticamente (case-insensitive)
  return Array.from(map.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
}

// --- NOVO: paginação + ordenação ---
export type SortBy = 'date' | 'title';
export type Order = 'asc' | 'desc';

export interface ListPostsOptions {
  owner?: string;
  sortBy?: SortBy;   // 'date' | 'title'  (default: 'date')
  order?: Order;     // 'asc' | 'desc'    (default: 'desc')
  page?: number;     // 1-based           (default: 1)
  pageSize?: number; //                   (default: 10, max 100)
}

export interface ListPostsPagedResult {
  items: PostSummary[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: SortBy;
  order: Order;
}

export async function listPostsPublicPaged(
  opts: ListPostsOptions = {}
): Promise<ListPostsPagedResult> {
  const {
    owner,
    sortBy = 'date',
    order = 'desc',
    page = 1,
    pageSize = 10,
  } = opts;

  // Carrega todos os posts (usa seu cache/revalidate já configurado)
  const all = await listPostsPublic(owner);

  // --- Ordenação ---
  const items = [...all];
  if (sortBy === 'date') {
    items.sort((a, b) => {
      const ta = a.date ? Date.parse(a.date) : (order === 'asc' ? Infinity : -Infinity);
      const tb = b.date ? Date.parse(b.date) : (order === 'asc' ? Infinity : -Infinity);
      if (ta !== tb) return order === 'asc' ? ta - tb : tb - ta;
      // desempate: título
      return (a.title || a.slug).localeCompare((b.title || b.slug), undefined, { sensitivity: 'base' });
    });
  } else {
    // sortBy = 'title'
    items.sort((a, b) => {
      const at = a.title || a.slug;
      const bt = b.title || b.slug;
      const cmp = at.localeCompare(bt, undefined, { sensitivity: 'base' });
      if (cmp !== 0) return order === 'asc' ? cmp : -cmp;
      // desempate: data (mais recente primeiro)
      const ta = a.date ? Date.parse(a.date) : 0;
      const tb = b.date ? Date.parse(b.date) : 0;
      return tb - ta;
    });
  }

  // --- Paginação ---
  const ps = Math.min(Math.max(1, pageSize), 100);
  const p = Math.max(1, page);
  const start = (p - 1) * ps;
  const paged = items.slice(start, start + ps);

  return {
    items: paged,
    total: items.length,
    page: p,
    pageSize: ps,
    sortBy,
    order,
  };
}
