import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const TOKEN = process.env.GITHUB_APP_TOKEN!;
const REPO_OWNER: string = process.env.GITHUB_REPO_OWNER || "";
const REPO_NAME: string = process.env.GITHUB_REPO_NAME || "";
const BRANCH: string = process.env.GITHUB_REPO_BRANCH || "main";
const DIR = "posts";
if (!TOKEN || !REPO_NAME || !REPO_OWNER) {
  throw new Error(
    "GITHUB_APP_TOKEN, GITHUB_OWNER, and GITHUB_REPO must be set"
  );
}
const octokit = new Octokit({ auth: TOKEN });

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  author?: string;
  category?: string;
  excerpt?: string;
  content?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const categorySlug = params.slug.toLowerCase();

  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const sort = url.searchParams.get("sort") || "desc";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: DIR,
      ref: BRANCH,
    });

    const files = Array.isArray(data) ? data : [];

    const posts: PostMeta[] = await Promise.all(
      files.map(async (file) => {
        const slug = file.name.replace(".md", "");

        const res = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: `${DIR}/${file.name}`,
          ref: BRANCH,
        });

        const content = Buffer.from(
          (res.data as any).content,
          "base64"
        ).toString("utf-8");

        const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
        const meta: PostMeta = {
          slug,
          title: slug,
          date: "",
          content,
        };

        if (frontmatterMatch) {
          frontmatterMatch[1].split("\n").forEach((line) => {
            const [key, ...rest] = line.split(":");
            if (!key || !rest) return;
            const value = rest.join(":").trim();
            (meta as any)[key.trim()] = value.replace(/^['"]|['"]$/g, "");
          });
        }

        const body = content.split("---")[2]?.trim() || "";
        meta.excerpt = body.substring(0, 200);

        return meta;
      })
    );

    const filtered = posts.filter((post) => {
      const matchTitle = post.title.toLowerCase().includes(search);
      const matchCategory =
        post.category?.toLowerCase() === categorySlug;
      return matchTitle && matchCategory;
    });

    const sorted = filtered.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return sort === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const total = sorted.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = sorted.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      posts: paginated,
      total,
      page,
      totalPages,
    });
  } catch (err: any) {
    console.error("Erro ao buscar posts da categoria:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
