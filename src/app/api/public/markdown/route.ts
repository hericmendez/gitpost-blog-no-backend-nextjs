// app/api/public/markdown/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { unified, type Plugin } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeExternalLinks from 'rehype-external-links';
import { visit } from 'unist-util-visit';
import type { Root } from 'hast';
import { rehypeImageBase } from '@/lib/rehype';
// (sem CORS aqui!)

/** <img> com atributos padrão */
const rehypeDefaultImgAttrs: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'element', (node: any) => {
    if (node.tagName === 'img') {
      node.properties ||= {};
      if (!('loading' in node.properties)) node.properties.loading = 'lazy';
      if (!('decoding' in node.properties)) node.properties.decoding = 'async';
    }
  });
};

/** Resolve src relativo de <img> usando base */


// (Opcional) GET só para teste no navegador:
export async function GET() {
  return NextResponse.json({
    ok: true,
    howTo: 'Envie POST com { markdown, options } (application/json).',
  });
}

export async function POST(req: Request) {
  const { markdown, options } = await req.json().catch(() => ({}));
  if (typeof markdown !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Body inválido: envie { markdown: string }' },
      { status: 400 },
    );
  }
  if (markdown.length > 500_000) {
    return NextResponse.json(
      { success: false, error: 'Markdown muito grande (>500KB)' },
      { status: 413 },
    );
  }

  const imageBase: string | undefined = options?.imageBase;
  const highlight = options?.highlight !== false;
  const openLinksInNewTab = options?.openLinksInNewTab ?? true;

  const schema: any = structuredClone(defaultSchema);
  schema.attributes ||= {};
  for (const tag of ['code', 'pre', 'span']) {
    schema.attributes[tag] = [
      ...(schema.attributes[tag] || []),
      ['className', 'spaceSeparated'],
    ];
  }
  for (const tag of ['h1','h2','h3','h4','h5','h6']) {
    schema.attributes[tag] = [...(schema.attributes[tag] || []), 'id'];
  }
  schema.tagNames = Array.from(new Set([...(schema.tagNames || []), 'img']));
  schema.attributes.img = [
    ...(schema.attributes.img || []),
    'alt','title','width','height','src','srcset','sizes','loading','decoding',
    ['className','spaceSeparated'],
  ];
  schema.attributes.a = [
    ...(schema.attributes.a || []),
    'href',['rel','spaceSeparated'],'target','title',
  ];

  let processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkEmoji)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeDefaultImgAttrs)
    .use(rehypeImageBase, { imageBase });

  if (openLinksInNewTab) {
    processor = processor.use(rehypeExternalLinks, {
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
    });
  }
  if (highlight) {
    processor = processor.use(rehypeHighlight,  true);
  }

  const file = await processor
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(markdown);

  return NextResponse.json({ success: true, html: String(file) });
}
