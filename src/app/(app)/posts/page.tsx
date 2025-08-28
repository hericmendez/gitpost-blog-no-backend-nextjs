'use client'

import React, { useEffect } from 'react'
import useSWR from 'swr'
import { getPosts, PostSummary } from '@/features/posts/postService'
import PostCard from '@/components/PostElements/PostCard'

export default function PostsPage() {
  const { data, error } = useSWR<PostSummary[]>("/api/posts", () =>
    getPosts()
  );

  useEffect(() => {
    getPosts();
  }, [data]);

  if (error) return <p className="p-4 text-red-500">Erro ao carregar posts</p>;
  if (!data) return <p className="p-4">Carregando...</p>;

  return (
    <div className="p-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {data.map((post: any) => (
        <div key={post?.slug} className="space-y-2">
          <PostCard
            title={post?.title}
            description={post?.category}
            slug={post?.slug}
            date={post?.date}
          />
        </div>
      ))}
    </div>
  );
}
