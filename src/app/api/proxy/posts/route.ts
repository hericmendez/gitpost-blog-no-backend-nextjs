// src/app/api/proxy/posts/route.ts
import { NextResponse } from "next/server";

const TOKEN_READONLY = process.env.GITHUB_GIGI_TOKEN_READONLY_GIGI!;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER!;
const REPO_NAME = "git-posts";
const BRANCH = "main";
const POSTS_DIR = "posts";

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${POSTS_DIR}?ref=${BRANCH}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${TOKEN_READONLY}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { success: false, error: err },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, files: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "err.message" },
      { status: 500 }
    );
  }
}
