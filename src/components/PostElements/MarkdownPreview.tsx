// src/components/LayoutElements/MarkdownPreview.tsx
'use client'

import Image from 'next/image'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  markdown: string, className?: string
}

export default function MarkdownPreview({ markdown, className }: Props) {
  return (
    <div className={`prose prose-lg lg:prose-xl dark:prose-invert max-w-none transition-colors duration-1000 ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h1 className="text-4xl font-extrabold mt-4 mb-2" {...props} />
          ),
          h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h2 className="text-3xl font-bold mt-4 mb-2" {...props} />
          ),
          h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h3 className="text-2xl font-semibold mt-3 mb-1.5" {...props} />
          ),
          h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h4 className="text-xl font-semibold mt-3 mb-1" {...props} />
          ),
          h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h5 className="text-lg font-medium mt-2 mb-1" {...props} />
          ),
          h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
            <h6 className="text-base font-medium mt-2 mb-1" {...props} />
          ),
          p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
            <p className="my-2 leading-relaxed" {...props} />
          ),
          a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
            <a
              className="text-blue-400 hover:underline"
              {...props}
            />
          ),
          img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
            <img
              className="my-4 rounded shadow-xl"
              src={props.src || '/placeholder.png'}
              alt={props.alt || ''}

            />
          ),
          blockquote: (props: React.BlockquoteHTMLAttributes<HTMLElement>) => (
            <blockquote
              className="pl-4 border-l-4 border-gray-600 italic my-4"
              {...props}
            />
          ),
          ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
            <ul className="list-disc list-inside my-2" {...props} />
          ),
          ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
            <ol className="list-decimal list-inside my-2" {...props} />
          ),
          li: (props: React.LiHTMLAttributes<HTMLLIElement>) => <li className="mt-1" {...props} />,
          code({
            node,
            inline,
            className,
            children,
            ...props
          }: {
            node?: any;
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
            [key: string]: any;
          }) {
            return inline ? (
              <code className=" bg-black px-1 rounded " {...props}>
                {children}
              </code>
            ) : (
              <pre className=" bg-gray-400 dark:bg-zinc-600 p-4 rounded my-4 overflow-auto  border-2 border-gray-200">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          hr: ({ node, ...props }: { node?: any;[key: string]: any }) => (
            <hr className="my-6 border-gray-700" {...props} />
          ),
        }}
      > 
        {markdown || "Digite algo à esquerda para ver o preview aqui..."}
      </ReactMarkdown>
    </div>
  );
}
