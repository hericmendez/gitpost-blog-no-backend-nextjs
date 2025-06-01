import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN = process.env.GITHUB_APP_TOKEN!;
const REPO_NAME: string = process.env.GITHUB_REPO_NAME || "";
const BRANCH: string = process.env.GITHUB_REPO_BRANCH || "main";
const DIR = "posts";

const octokit = new Octokit({ auth: TOKEN });

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const url = new URL(_req.url);
  const owner = url.searchParams.get("owner");

  if (!slug || !owner) {
    return NextResponse.json(
      { success: false, error: "Slug e/ou owner ausentes." },
      { status: 400 }
    );
  }

  try {
    const res = await octokit.repos.getContent({
      owner,
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;
  console.log("accessToken ==> ", accessToken);
  const owner = session?.username;

  if (!accessToken || !owner) {
    return NextResponse.json(
      { success: false, error: "Usuário não autenticado." },
      { status: 401 }
    );
  }

  const octokit = new Octokit({ auth: accessToken });
  const slug = params.slug.replace(".md", "");

  try {
    // Primeiro pega o SHA do arquivo (necessário pro delete)
    const { data } = await octokit.repos.getContent({
      owner,
      repo: REPO_NAME,
      path: `${DIR}/${slug}.md`,
      ref: BRANCH,
    });

    const sha = (data as any).sha;

    // Agora deleta
    await octokit.repos.deleteFile({
      owner,
      repo: REPO_NAME,
      path: `${DIR}/${slug}.md`,
      message: `Delete post ${slug}.md`,
      sha,
      branch: BRANCH,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao deletar post:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
