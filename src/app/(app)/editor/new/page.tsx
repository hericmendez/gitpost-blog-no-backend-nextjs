import PostEditor from "@/components/PostElements/PostEditor";

export default function EditorPage() {
  return (
    <main className="min-h-screen transition-colors duration-1000 bg-gray-100 dark:bg-zinc-900 dark:text-white">
      <h1 className="text-3xl font-bold p-2">Editor de Post</h1>

      <PostEditor />
    </main>
  );
}