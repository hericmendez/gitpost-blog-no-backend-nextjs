// src/features/posts/PostsDashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { deletePost, getPosts, PostSummary } from "./postService";


export default function PostsDashboard() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getPosts();
      console.log("data from loadPosts ==> ", data);
      setPosts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(slug: string) {
    if (confirm("Deseja realmente deletar este post?")) {
      try {
        await deletePost(slug);
        await loadPosts(); // <- força recarregar a lista atualizada da API
      } catch (err: any) {
        alert("Erro ao deletar post: " + err.message);
      }
    }
  }
  

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Painel de Posts</h1>
      {loading && <p>Carregando posts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map(({ slug, frontmatter }) => (
          <div
            key={slug}
            className="rounded-xl border shadow p-4 bg-white dark:bg-zinc-900 dark:text-white"
          >
            <h2 className="text-xl font-semibold">{frontmatter.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{frontmatter.date}</p>
            {frontmatter.category && (
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {frontmatter.category}
              </span>
            )}
            <button

              className="mt-4 w-full"
              onClick={() => handleDelete(slug)}
            >
              Deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
