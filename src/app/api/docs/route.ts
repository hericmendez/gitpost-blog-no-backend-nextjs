import { NextResponse } from "next/server";

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Documentação da API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 2rem;
          background: #f9f9f9;
          color: #333;
        }
        h1 {
          color: #111;
          border-bottom: 2px solid #ccc;
          padding-bottom: 0.5rem;
        }
        .endpoint {
          background: #fff;
          border: 1px solid #ddd;
          border-left: 5px solid #444;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        code {
          background: #eee;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.95rem;
        }
        .method {
          font-weight: bold;
          color: #007acc;
        }
        ul {
          margin-top: 0.5rem;
          padding-left: 1.2rem;
        }
        .download {
          display: inline-block;
          margin-top: 2rem;
          padding: 0.6rem 1rem;
          background: #007acc;
          color: white;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
        }
        .download:hover {
          background: #005e99;
        }
      </style>
    </head>
    <body>
      <h1>📚 Documentação da API</h1>

      <div class="endpoint">
        <div><span class="method">GET</span> <code>/api/posts</code></div>
        <p>Retorna uma lista paginada de posts.</p>
        <strong>Parâmetros de query:</strong>
        <ul>
          <li><code>search</code>: filtra por título do post</li>
          <li><code>category</code>: filtra por categoria</li>
          <li><code>sort</code>: <code>asc</code> ou <code>desc</code></li>
          <li><code>page</code>: número da página</li>
          <li><code>limit</code>: posts por página</li>
        </ul>
      </div>

      <div class="endpoint">
        <div><span class="method">GET</span> <code>/api/posts/[slug]</code></div>
        <p>Retorna os dados completos de um post com base no slug.</p>
      </div>

      <div class="endpoint">
        <div><span class="method">GET</span> <code>/api/categories</code></div>
        <p>Retorna uma lista com todas as categorias disponíveis.</p>
      </div>

      <div class="endpoint">
        <div><span class="method">GET</span> <code>/api/category/[slug]</code></div>
        <p>Retorna os posts de uma categoria específica, identificada pelo slug.</p>
      </div>

      <a class="download" href="/gitpost-api.postman_collection.json" download>
        📥 Baixar Collection do Postman
      </a>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
