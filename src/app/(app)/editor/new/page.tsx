import PostEditor from "@/components/PostElements/PostEditor";

export default function EditorPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <h1 className="text-3xl font-bold p-6">Editor de Post</h1>
      <PostEditor />
    </main>
  )
}