"use client";
import PostEditor from "@/components/PostElements/PostEditor";
import { getPostBySlug } from "@/features/posts/postService";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function EditPostPage({ params }: PageProps) {
  const { slug } = params;
  const owner = localStorage.getItem("git_owner");
  console.log("owner ==> ", owner);
  const post = await getPostBySlug(slug);
  console.log("post in editor/[slug]/page.tsx ==> ", post);

  if (!post || !owner) return notFound();

  return (
    <PostEditor
      mode="edit"
      slug={slug}
      owner={owner}
      initialTitle={post.title}
      initialAuthor={post.author}
      initialCategory={post.category}
      initialContent={post.content}
    />
  );
}
