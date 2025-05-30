// src/features/posts/postService.ts
export const dynamic = "force-dynamic";

import { fetchPostFromGitHub } from "@/lib/github";
import { parseMarkdownFile } from "@/lib/markdown";
export interface CreatePostParams {
  title: string;
  author: string;
  category: string;
  content: string;
}

export interface PostFrontmatter {
  title: string;
  author?: string;
  category?: string;
  date: string;
}

export async function createPost(params: CreatePostParams) {
  const res = await fetch("/api/posts/github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const json = await res.text();
    throw new Error(`API error ${res.status}: ${json}`);
  }
  return res.json();
}
export interface PostSummary {
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    category?: string;
  };
}

// src/lib/github/getPosts.ts
export async function getPosts(): Promise<PostSummary[]> {
  const owner =
    typeof window !== "undefined" ? localStorage.getItem("git-owner") : null;

  if (!owner) {
    throw new Error("Nome do repositório não encontrado. Usuário não logado?");
  }

  const repo = `${owner}/git-posts`;

  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/posts`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Erro ao buscar posts: ${res.status}`);
  }

  const files = await res.json();

  const posts = await Promise.all(
    files.map(async (file: any) => {
      const raw = await fetch(file.download_url);
      const content = await raw.text();
      return parseMarkdownFile(content, file.name.replace(".md", ""));
    })
  );

  return posts;
}

export async function getPostBySlug(slug: string) {
  console.log("🔍 Buscando slug:", slug);

  try {
    const content = await fetchPostFromGitHub(slug);
    const [meta, ...bodyLines] = content.split("---\n").slice(1);
    const metaLines = meta.split("\n").filter(Boolean);

    const metadata: Record<string, string> = {};
    for (const line of metaLines) {
      const [key, ...rest] = line.split(":");
      metadata[key.trim()] = rest.join(":").trim();
    }

    const sanitize = (val?: string) =>
      val?.trim().replace(/^["']+|["']+$/g, "") ?? "";

    return {
      slug,
      title: sanitize(metadata.title),
      author: sanitize(metadata.author),
      category: sanitize(metadata.category),
      content: bodyLines.join("---\n").trim(),
    };
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    console.log("❌ Post não encontrado no GitHub: ", slug);
    console.log("❌ Verifique se o slug está correto.");
    return null;
  }
}





export async function deletePost(slug: string) {
  const res = await fetch(`/api/posts/${slug}`, {
    method: "DELETE",
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Delete failed (${res.status}): ${txt}`);
  }

  return res.json();
}
