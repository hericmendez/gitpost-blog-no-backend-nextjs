// src/components/LayoutElements/PostEditor.tsx
'use client'

import React, { useState } from 'react'
import MarkdownPreview from './MarkdownPreview'
import { createPost } from '@/features/posts/postService'

export default function PostEditor() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [md, setMd] = useState('')
  async function handleSave() {
    const result = await createPost({
      title,
      author,
      category,
      content: md
    })

    if (result.success) {
      alert('Post salvo com sucesso: ' + result.slug)
      // opcionalmente limpar campos
      setTitle('')
      setAuthor('')
      setCategory('')
      setMd('')
    } else {
      alert('Erro ao salvar: ' + result.error)
    }
  }
  const insertAtCursor = (before: string, after = '') => {
    const ta = document.getElementById('md-editor') as HTMLTextAreaElement
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = md.slice(start, end)
    const next = md.slice(0, start) + before + selected + after + md.slice(end)
    setMd(next)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + before.length + (selected.length || after.length)
      ta.setSelectionRange(pos, pos)
    })
  }

  const handleHeader = (level: number) => insertAtCursor('#'.repeat(level) + ' ')
  const handleBold   = () => insertAtCursor('**', '**')
  const handleItalic = () => insertAtCursor('_', '_')
  const handleCode   = () => insertAtCursor('`', '`')
  const handleList   = () => insertAtCursor('- ')
  const handleQuote  = () => insertAtCursor('> ')
  const handleLine   = () => insertAtCursor('\n')
  const handleIndent = () => insertAtCursor('  ')
  const handleLink   = () => {
    const url  = prompt('URL do link:')
    const txt  = prompt('Texto do link:', 'meu link') || ''
    if (url) insertAtCursor(`[${txt}](${url})`)
  }
  const handleImage  = () => {
    const url = prompt('URL da imagem:')
    const alt = prompt('Texto alternativo:', '') || ''
    if (url) insertAtCursor(`![${alt}](${url})`)
  }

  return (
    <div className='flex flex-col justify-center p-6'>
        <div className="grid lg:grid-cols-2 gap-6  overflow-hidden">
      {/* PANEL DE EDIÇÃO */}
      <div className="">
        <div className="flex flex-col gap-4">
          <input
            className="p-2 border rounded bg-zinc-800 text-white"
            placeholder="Título"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            className="p-2 border rounded bg-zinc-800 text-white"
            placeholder="Autor"
            value={author}
            onChange={e => setAuthor(e.target.value)}
          />
          <input
            className="p-2 border rounded bg-zinc-800 text-white"
            placeholder="Categoria"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap gap-2 text-sm border-1 p-2 my-2 rounded-sm">
          {/* Dropdown H1–H6 */}
          <div className="relative group">
            <button className="px-2 py-1 bg-zinc-700 rounded text-white">
              Títulos ▼
            </button>
            <div className="absolute hidden group-hover:flex flex-col bg-zinc-800 text-white mt-1 rounded z-10">
              {[1,2,3,4,5,6].map(lvl => (
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

          <ToolbarBtn label="B"    onClick={handleBold} />
          <ToolbarBtn label="I"    onClick={handleItalic} />
          <ToolbarBtn label="<>​"   onClick={handleCode} />
          <ToolbarBtn label="• Lista" onClick={handleList} />
          <ToolbarBtn label="❝ Quote" onClick={handleQuote} />
          <ToolbarBtn label="🔗 Link"  onClick={handleLink} />
          <ToolbarBtn label="🖼️ Imagem" onClick={handleImage} />
          <ToolbarBtn label="↵ Line"  onClick={handleLine} />
          <ToolbarBtn label="⇥ Indent" onClick={handleIndent} />
        </div>

        {/* TEXTAREA */}
        <textarea
          id="md-editor"
          className="w-full h-[50dvh] border rounded p-2 bg-zinc-900 text-white font-mono"
          placeholder="Digite seu conteúdo em Markdown..."
          value={md}
          onChange={e => setMd(e.target.value)}
        />

      </div>

      {/* PANEL DE PREVIEW */}
      <MarkdownPreview markdown={md} />
    </div>
    <div>
        <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 "
      >
        Salvar no GitHub
      </button> 
    </div>

   
    </div>

    
  )
}

function ToolbarBtn({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 bg-zinc-700 rounded text-white hover:bg-zinc-600"
    >
      {label}
    </button>
  )
}
