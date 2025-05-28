"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold mb-6">Entrar com GitHub</h1>
        <p className="text-sm text-gray-600 mb-6">
          Ao entrar, será criado automaticamente um repositório{" "}
          <code>git-posts</code> com seus posts.
        </p>
        <button
          onClick={() => signIn("github")}
          className="w-full bg-black text-white p-3 rounded-md font-semibold hover:bg-gray-800 transition"
        >
          Entrar com GitHub
        </button>
      </div>
    </div>
  );
}
