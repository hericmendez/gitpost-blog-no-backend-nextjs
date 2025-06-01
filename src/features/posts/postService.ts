export const dynamic = "force-dynamic";

const TOKEN: string = process.env.GITHUB_APP_TOKEN!; 
  import { fetchPostFromGitHub } from "@/lib/github";
  import { parseMarkdownFile } from "@/lib/markdown";
  console.log("TOKEN ==> ", TOKEN);
  if (!TOKEN) {
    throw new Error("Token de leitura não configurada.");
  }
  // ✅ Helper: só funciona no client
  function getGitOwner(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("git-owner");
  }

  // 🟢 CREATE
  export interface CreatePostParams {
    title: string;
    author: string;
    category: string;
    content: string;
    owner: string;
  }

  export async function createPost(params: CreatePostParams) {
    const owner = getGitOwner();
    if (!owner) throw new Error("Usuário não logado.");

    const res = await fetch(`/api/posts/github?owner=${owner}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, owner }),
    });

    if (!res.ok) {
      const json = await res.text();
      throw new Error(`API error ${res.status}: ${json}`);
    }

    return res.json();
  }

  // 🟢 GET MULTIPLOS POSTS
  export interface PostSummary {
    slug: string;
    frontmatter: {
      title: string;
      date: string;
      category?: string;
    };
  }

  export async function getPosts(): Promise<PostSummary[]> {
    const owner = getGitOwner();
    if (!owner) throw new Error("Usuário não logado.");

    if (!TOKEN) throw new Error("Token de leitura não configurada.");

    const repo = `${owner}/git-posts`;

    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/posts`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro ao buscar posts: ${res.status} - ${errorText}`);
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

  // 🟢 GET ÚNICO POST
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
      return null;
    }
  }

  // 🟢 DELETE
  export async function deletePost(slug: string) {
    const owner = getGitOwner();
    if (!owner) throw new Error("Usuário não logado.");

    const res = await fetch(`/api/posts/${slug}?owner=${owner}`, {
      method: "DELETE",
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Delete failed (${res.status}): ${txt}`);
    }

    return res.json();
  }
