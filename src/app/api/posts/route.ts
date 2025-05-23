import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN = "";
const OWNER = "hericmendez";
const REPO = "git-posts";
const BRANCH = "main";
const DIR = "posts";
const octokit = new Octokit({ auth: TOKEN });

export async function GET() {
  try {
    const { data } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: DIR,
      ref: BRANCH,
    });

    const files = Array.isArray(data) ? data : [];

    const posts = await Promise.all(
      files.map(async (file) => {
        const slug = file.name.replace(".md", "");

        const res = await octokit.repos.getContent({
          owner: OWNER,
          repo: REPO,
          path: `${DIR}/${file.name}`,
          ref: BRANCH,
        });

        const content = Buffer.from((res.data as any).content, "base64").toString("utf-8");

        const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
        let frontmatter = { title: slug, date: "" };

        if (frontmatterMatch) {
          frontmatterMatch[1].split("\n").forEach((line) => {
            const [key, value] = line.split(":").map((s) => s.trim());
            if (key && value) (frontmatter as any)[key] = value;
          });
        }

        return { slug, frontmatter };
      })
    );

    return NextResponse.json(posts);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}