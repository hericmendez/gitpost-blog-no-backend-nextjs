import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const TOKEN = process.env.GITHUB_APP_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";
if (!TOKEN || !OWNER || !REPO) {
  throw new Error(
    "GITHUB_APP_TOKEN, GITHUB_OWNER, and GITHUB_REPO must be set"
  );
}

const octokit = new Octokit({ auth: TOKEN });

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const filePath = `posts/${slug}.md`;

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: OWNER!,
      repo: REPO!,
      path: filePath,
      ref: BRANCH,
    });

    const sha = (data as any).sha;

    console.log("SHA ==> ", sha);
    console.log("DELETING FILE: ", filePath);

    const response = await octokit.repos.deleteFile({
      owner: OWNER!,
      repo: REPO!,
      path: filePath,
      message: `Delete post ${slug}`,
      sha: sha,
      branch: BRANCH,
    });

    console.log("DELETE SUCCESS:", response.status);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao deletar:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

