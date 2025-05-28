// src/app/api/posts/github/route.ts
import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import slugify, { generateSafeSlug } from "@/lib/slugify";
import { createMarkdown } from "@/lib/markdown";
import { useSessionUser } from "@/hooks/useSessionUser";
const TOKEN = process.env.GITHUB_APP_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;
const BRANCH = process.env.GITHUB_REPO_BRANCH || "main";
const POSTS_DIR = "posts";

if (!TOKEN || !REPO_OWNER || !REPO_NAME) {
  throw new Error(
    "GITHUB_APP_TOKEN, GITHUB_OWNER, and GITHUB_REPO must be set"
  );
}

const octokit = new Octokit({ auth: TOKEN });

export async function POST(request: Request) {
  try {
    const { title, author, category, content } = await request.json();

    const slug = generateSafeSlug(title);
    console.log("slug ==> ", slug);

    const fileName = `${slug}.md`;

    const path = `${POSTS_DIR}/${fileName}`;

    const markdown = createMarkdown(
      { title, author, category, date: new Date().toISOString() },
      content
    );

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER as string,
      repo: REPO_NAME as string,
      path,
      message: `Add post ${fileName}`,
      content: Buffer.from(markdown).toString("base64"),
      branch: BRANCH,
    });

    return NextResponse.json({ success: true, slug: fileName });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
