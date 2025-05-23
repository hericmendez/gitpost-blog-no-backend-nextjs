'use client'

import React, { useEffect } from 'react'
import useSWR from 'swr'
import { getPosts,  deletePost, PostSummary } from '@/features/posts/postService'
import PostCard from '@/components/PostElements/PostCard'
import Link from "next/link";

export default function PostsPage() {
  const { data, error, mutate } = useSWR<PostSummary[]>("/api/posts", () =>
    getPosts()
  );

  useEffect(() => {
    getPosts();
    console.log("data useeffect ==> ", data);
  }, [data]);
  if (error) return <p className="p-4 text-red-500">Erro ao carregar posts</p>;
  if (!data) return <p className="p-4">Carregando...</p>;

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data.map((post) => (
        <div key={post.slug} className="space-y-2">
          <PostCard
            title={post.frontmatter.title}
            description={post.frontmatter.category}
            slug={post.slug}
            date={post.frontmatter.date}
          />
          <Link href={`/editor/${post.slug}`}>
            <button className="px-3 py-1 bg-yellow-300 text-black rounded hover:bg-red-500 text-sm mr-4">
              Editar
            </button>
          </Link>
          <button
            onClick={async () => {
              if (!confirm("Confirma delete deste post?")) return;
              await deletePost(post.slug);
              mutate();
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 text-sm"
          >
            Deletar
          </button>
        </div>
      ))}
    </div>
  );
}
