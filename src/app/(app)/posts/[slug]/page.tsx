"use client";

import { useEffect, useState } from "react";
        import { useRouter } from 'next/navigation';

import { use } from "react";
import MarkdownPreview from "@/components/PostElements/MarkdownPreview";
import { getPostBySlug } from "@/features/posts/postService";
import type { Post } from "@/types/post";

type PageProps = { params: Promise<{ slug: string }> };

export default function PostViewPage({ params }: PageProps) {
  const { slug } = use(params); 
  const router = useRouter();   

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchPost = async () => {
      try {
        const postData = await getPostBySlug(slug);
        const owner =
          typeof window !== "undefined"
            ? localStorage.getItem("git_owner")
            : null;

        if (!active) return;

        if (!postData || !owner) {
          setMissing(true);
          setLoading(false);
          return;
        }

        setPost(postData);
        setLoading(false);
      } catch (e) {
        console.error("fetchPost error =>", e);
        setMissing(true);
        setLoading(false);
      }
    };

    fetchPost();
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <div className="p-5">Carregando…</div>;

  if (missing) {
    return (
      <div className="p-5">
        <h2 className="text-2xl font-bold mb-2">Página não encontrada</h2>
        <p className="text-muted mb-4">
          O post não existe ou você ainda não definiu o <em>owner</em>.
        </p>
        <button
          className="px-4 py-2 rounded bg-gray-200"
          onClick={() => router.push("/select-owner")}
        >
          Definir owner
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-2">{post?.title}</h2>
      <p className="text-slate-400 text-sm">Categoria: {post?.category}</p>
      <p className="text-slate-400 text-sm mb-5">Autor: {post?.author}</p>
      <MarkdownPreview markdown={post?.content || ""} />
    </div>
  );
}
