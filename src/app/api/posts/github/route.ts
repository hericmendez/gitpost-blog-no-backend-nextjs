// src/app/api/posts/github/route.ts
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { generateSafeSlug } from "@/lib/slugify";
import { createMarkdown } from "@/lib/markdown";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const REPO_NAME = "git-posts";
const BRANCH = process.env.GITHUB_REPO_BRANCH || "main";
const POSTS_DIR = "posts";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken || !session.username) {
    return NextResponse.json(
      {
        success: false,
        error: `Acesso não autorizado ou token ausente. 
        File Path: src/app/api/posts/github/route.ts`,
      },
      { status: 401 }
    );
  }

  const octokit = new Octokit({ auth: session.accessToken });

  try {
    const { title, author, category, content } = await request.json();

    const slug = generateSafeSlug(title);
    const fileName = `${slug}.md`;
    const path = `${POSTS_DIR}/${fileName}`;

    const markdown = createMarkdown(
      {
        title,
        author,
        category,
        date: new Date().toISOString(),
      },
      content
    );

    await octokit.repos.createOrUpdateFileContents({
      owner: session.username,
      repo: REPO_NAME,
      path,
      message: `Add post ${fileName}`,
      content: Buffer.from(markdown).toString("base64"),
      branch: BRANCH,
    });

    return NextResponse.json({ success: true, slug: fileName });
  } catch (err: any) {
    console.error("Erro ao criar post:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Erro interno ao criar post.",
      },
      { status: 500 }
    );
  }
}
