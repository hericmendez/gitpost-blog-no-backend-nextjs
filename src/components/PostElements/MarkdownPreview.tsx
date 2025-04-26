// src/components/LayoutElements/MarkdownPreview.tsx
'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  markdown: string
}

export default function MarkdownPreview({ markdown }: Props) {
  return (
    <div className="prose prose-lg lg:prose-xl dark:prose-invert max-w-none bg-zinc-900 p-6 border-2 border-gray-200 rounded overflow-y-scroll">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-4xl font-extrabold mt-4 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-4 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-2xl font-semibold mt-3 mb-1.5" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-xl font-semibold mt-3 mb-1" {...props} />,
          h5: ({ node, ...props }) => <h5 className="text-lg font-medium mt-2 mb-1" {...props} />,
          h6: ({ node, ...props }) => <h6 className="text-base font-medium mt-2 mb-1" {...props} />,
          p: ({ node, ...props }) => <p className="my-2 leading-relaxed" {...props} />,
          a: ({ node, href, ...props }) => (
            <a href={href} className="text-blue-400 hover:underline" {...props} />
          ),
          img: ({ node, alt, ...props }) => (
            <img className="my-4 rounded shadow-xl" alt={alt} {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="pl-4 border-l-4 border-gray-600 italic my-4" {...props} />
          ),
          ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2" {...props} />,
          li: ({ node, ...props }) => <li className="mt-1" {...props} />,
          code({ node, inline, className, children, ...props }) {
            return inline ? (
              <code className=" bg-black px-1 rounded " {...props}>
                {children}
              </code>
            ) : (
              <pre className=" bg-zinc-800 p-4 rounded my-4 overflow-auto  border-2 border-gray-200">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            )
          },
          hr: ({ node, ...props }) => <hr className="my-6 border-gray-700" {...props} />,
        }}
      >
        {markdown || 'Digite algo à esquerda para ver o preview aqui...'}
      </ReactMarkdown>
    </div>
  )
}
