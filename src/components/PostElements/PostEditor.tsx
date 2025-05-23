"use client";

import React, { useState, useEffect } from "react";
import MarkdownPreview from "./MarkdownPreview";
import { createPost, deletePost } from "@/features/posts/postService";

type PostEditorProps = {
  mode?: "create" | "edit";
  initialTitle?: string;
  initialAuthor?: string;
  initialCategory?: string;
  initialContent?: string;
  slug?: string;
};

export default function PostEditor({
  mode = "create",
  initialTitle = "",
  initialAuthor = "",
  initialCategory = "",
  initialContent = "",
  slug,
}: PostEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [category, setCategory] = useState(initialCategory);
  const [md, setMd] = useState(initialContent);

  useEffect(() => {
    setTitle(initialTitle);
    setAuthor(initialAuthor);
    setCategory(initialCategory);
    setMd(initialContent);
  }, [initialTitle, initialAuthor, initialCategory, initialContent]);

  async function handleSave() {
    if (mode === "edit") {
      if (!slug) return alert("Slug não fornecido.");

      const newSlug = slug.replace(".md", "") + "_edited";

      // 1. Cria novo post
      const result = await createPost({
        title,
        author,
        category,
        content: md,
      });

      if (!result.success) {
        alert("Erro ao criar versão editada: " + result.error);
        return;
      }

      // 2. Deleta o post antigo
      try {
        await deletePost(slug);
      } catch (e) {
        console.warn("⚠️ Não foi possível deletar o post antigo:", e);
      }

      alert("Post editado com sucesso!");
      // Opcional: redirecionar para o novo editor
      // router.push(`/editor/${result.slug}`)
    } else {
      // fluxo original de criação
      const result = await createPost({
        title,
        author,
        category,
        content: md,
      });
      if (result.success) {
        alert("Post salvo com sucesso: " + result.slug);
        setTitle("");
        setAuthor("");
        setCategory("");
        setMd("");
      } else {
        alert("Erro ao salvar: " + result.error);
      }
    }
  }

  const insertAtCursor = (before: string, after = "") => {
    const ta = document.getElementById("md-editor") as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = md.slice(start, end);
    const next = md.slice(0, start) + before + selected + after + md.slice(end);
    setMd(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + (selected.length || after.length);
      ta.setSelectionRange(pos, pos);
    });
  };

  const handleHeader = (level: number) =>
    insertAtCursor("#".repeat(level) + " ");
  const handleBold = () => insertAtCursor("**", "**");
  const handleItalic = () => insertAtCursor("_", "_");
  const handleCode = () => insertAtCursor("`", "`");
  const handleList = () => insertAtCursor("- ");
  const handleQuote = () => insertAtCursor("> ");
  const handleLine = () => insertAtCursor("\n");
  const handleIndent = () => insertAtCursor("  ");
  const handleLink = () => {
    const url = prompt("URL do link:");
    const txt = prompt("Texto do link:", "meu link") || "";
    if (url) insertAtCursor(`[${txt}](${url})`);
  };
  const handleImage = () => {
    const url = prompt("URL da imagem:");
    const alt = prompt("Texto alternativo:", "") || "";
    if (url) insertAtCursor(`![${alt}](${url})`);
  };

  return (
    <div className="flex flex-col justify-center p-6">
      <div className="grid lg:grid-cols-2 gap-6 overflow-hidden">
        {/* EDIÇÃO */}
        <div>
          <div className="flex flex-col gap-4">
            <input
              className="p-2 border rounded bg-zinc-800 text-white"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={mode === "edit"}
            />
            <input
              className="p-2 border rounded bg-zinc-800 text-white"
              placeholder="Autor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={mode === "edit"}
            />
            <input
              className="p-2 border rounded bg-zinc-800 text-white"
              placeholder="Categoria"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={mode === "edit"}
            />
          </div>

          <div className="flex flex-wrap gap-2 text-sm border-1 p-2 my-2 rounded-sm">
            <div className="relative group">
              <button className="px-2 py-1 bg-zinc-700 rounded text-white">
                Títulos ▼
              </button>
              <div className="absolute hidden group-hover:flex flex-col bg-zinc-800 text-white mt-1 rounded z-10">
                {[1, 2, 3, 4, 5, 6].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => handleHeader(lvl)}
                    className="px-3 py-1 hover:bg-zinc-700 text-left"
                  >
                    H{lvl}
                  </button>
                ))}
              </div>
            </div>
            <ToolbarBtn label="B" onClick={handleBold} />
            <ToolbarBtn label="I" onClick={handleItalic} />
            <ToolbarBtn label="<>​" onClick={handleCode} />
            <ToolbarBtn label="• Lista" onClick={handleList} />
            <ToolbarBtn label="❝ Quote" onClick={handleQuote} />
            <ToolbarBtn label="🔗 Link" onClick={handleLink} />
            <ToolbarBtn label="🖼️ Imagem" onClick={handleImage} />
            <ToolbarBtn label="↵ Line" onClick={handleLine} />
            <ToolbarBtn label="⇥ Indent" onClick={handleIndent} />
          </div>

          <textarea
            id="md-editor"
            className="w-full h-[50dvh] border rounded p-2 bg-zinc-900 text-white font-mono"
            placeholder="Digite seu conteúdo em Markdown..."
            value={md}
            onChange={(e) => setMd(e.target.value)}
          />
        </div>

        {/* PREVIEW */}
        <MarkdownPreview markdown={md} />
      </div>

      <div>
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          {mode === "edit" ? "Salvar alterações" : "Salvar no GitHub"}
        </button>
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 bg-zinc-700 rounded text-white hover:bg-zinc-600"
    >
      {label}
    </button>
  );
}
