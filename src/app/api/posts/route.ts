import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN: string = process.env.GITHUB_APP_TOKEN!;
const REPO_OWNER: string = process.env.GITHUB_REPO_OWNER!;
const REPO_NAME: string = process.env.GITHUB_REPO_NAME!;
const BRANCH: string = process.env.GITHUB_REPO_BRANCH || "main";
const DIR = "posts";

if (!TOKEN || !REPO_OWNER || !REPO_NAME) {
  throw new Error("Missing required GitHub environment variables.");
}

const octokit = new Octokit({ auth: TOKEN });

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  author?: string;
  category?: string;
  excerpt?: string;
}

export async function GET(request: NextRequest) {
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

    const filtered = posts.filter((post) =>
      post.title.toLowerCase().includes(search)
    );

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
    console.error("Erro ao buscar posts:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
