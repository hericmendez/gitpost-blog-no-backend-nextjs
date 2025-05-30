import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { nanoid } from "nanoid";

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
  content?: string;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const sort = url.searchParams.get("sort") || "desc";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const categoryFilter = url.searchParams.get("category")?.toLowerCase();

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
      const matchCategory = categoryFilter
        ? post.category?.toLowerCase() === categoryFilter
        : true;
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
    console.error("Erro ao buscar posts:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, author, category, content } = body;

    if (!title || !author || !category || !content) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const date = new Date().toISOString();
    const safeTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${safeTitle}-${nanoid(6)}`;

    const filePath = `${DIR}/${slug}.md`;
    const frontmatter = `---\ntitle: ${title}\ndate: ${date}\nauthor: ${author}\ncategory: ${category}\n---\n\n`;

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: `Add new post: ${title}`,
      content: Buffer.from(frontmatter + content).toString("base64"),
      branch: BRANCH,
    });

    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    console.error("Erro ao criar post:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
