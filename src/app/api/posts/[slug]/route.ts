import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN = process.env.GITHUB_APP_TOKEN!;
const REPO_OWNER: string = process.env.GITHUB_REPO_OWNER || "";
const REPO_NAME: string = process.env.GITHUB_REPO_NAME || "";
const BRANCH: string = process.env.GITHUB_REPO_BRANCH || "main";
const DIR = "posts";

const octokit = new Octokit({ auth: TOKEN });

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  if (!slug)
    return NextResponse.json(
      { success: false, error: "Slug não fornecido." },
      { status: 400 }
    );

  try {
    const res = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `${DIR}/${slug}.md`,
      ref: BRANCH,
    });

    const content = Buffer.from((res.data as any).content, "base64").toString(
      "utf-8"
    );

    const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
    const meta: any = { slug, title: slug, date: "", content };

    if (frontmatterMatch) {
      frontmatterMatch[1].split("\n").forEach((line: string) => {
        const [key, ...rest] = line.split(":");
        if (!key || !rest) return;
        const value = rest.join(":").trim();
        meta[key.trim()] = value.replace(/^['"]|['"]$/g, "");
      });
    }

    return NextResponse.json(meta);
  } catch (err: any) {
    console.error("Erro ao buscar post:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
