'use client'
import PostEditor from '@/components/PostElements/PostEditor'
import { getPostBySlug } from '@/features/posts/postService'
//port { notFound } from 'next/navigation'
import { use, useEffect, useState } from 'react'

type PageProps = { params: Promise<{ slug: string }> };
export default function EditPostPage({ params }: PageProps) {
  const { slug } = use(params)
  const owner =
    typeof window !== 'undefined' ? localStorage.getItem('git_owner') : null
  type Post = {
    slug: string
    title: string
    author: string
    category: string
    content: string
  } | null
  const [post, setPost] = useState<Post>(null)
  useEffect(() => {
    try {
      const fetchPost = async () => {
        const postData = await getPostBySlug(slug)
        console.log('postData ==> ', postData)
        setPost(postData)

        //if (!post || !owner) return notFound()
      }
      fetchPost()
    } catch (error) {
      console.log('error ==> ', error)
    }
  }, [slug, owner, post])

  return (
    <PostEditor
      mode='edit'

      slug={slug}
      owner={owner || ''}
      initialTitle={post?.title}
      initialAuthor={post?.author}
      initialCategory={post?.category}
      initialContent={post?.content}
    />
  )
}
