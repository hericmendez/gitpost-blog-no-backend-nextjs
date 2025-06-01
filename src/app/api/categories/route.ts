import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const TOKEN = process.env.GITHUB_APP_TOKEN!;

const REPO_NAME = process.env.GITHUB_REPO_NAME!;
const BRANCH = process.env.GITHUB_REPO_BRANCH || "main";
const DIR = "posts";

const octokit = new Octokit({ auth: TOKEN });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const owner = url.searchParams.get("owner");

  if (!owner) {
    return NextResponse.json(
      {
        success: false,
        error: `Parâmetro 'owner' é obrigatório.
           File Path: src/app/api/categories/route.ts`,
      },
      { status: 400 }
    );
  }
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo: REPO_NAME,
      path: DIR,
      ref: BRANCH,
    });

    const files = Array.isArray(data) ? data : [];
    const categories = new Set<string>();

    for (const file of files) {
      const res = await octokit.repos.getContent({
        owner,
        repo: REPO_NAME,
        path: `${DIR}/${file.name}`,
        ref: BRANCH,
      });

      const content = Buffer.from((res.data as any).content, "base64").toString(
        "utf-8"
      );

      const match = content.match(/category:\s*(.+)/);
      if (match && match[1]) {
        categories.add(match[1].trim().toLowerCase());
      }
    }

    return NextResponse.json({ categories: Array.from(categories) });
  } catch (err: any) {
    console.error("Erro ao buscar categorias:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
