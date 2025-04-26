// src/app/api/posts/github/route.ts
import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import slugify from '@/lib/slugify'
import { createMarkdown } from '@/lib/markdown'

const GITHUB_TOKEN = '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'
const REPO_OWNER  = 'hericmendez'
const REPO_NAME   = 'git-posts'
const BRANCH      = 'main'
const POSTS_DIR   = 'posts'

const octokit = new Octokit({ auth: GITHUB_TOKEN })

export async function POST(request: Request) {
  try {
    const { title, author, category, content } = await request.json()

    const slug      = slugify(title)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName  = `${slug}_${timestamp}.md`
    const path      = `${POSTS_DIR}/${fileName}`

    const markdown = createMarkdown(
      { title, author, category, date: new Date().toISOString() },
      content
    )

    await octokit.repos.createOrUpdateFileContents({
      owner:  REPO_OWNER,
      repo:   REPO_NAME,
      path,
      message: `Add post ${fileName}`,
      content: Buffer.from(markdown).toString('base64'),
      branch:  BRANCH,
    })

    return NextResponse.json({ success: true, slug: fileName })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
