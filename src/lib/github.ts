export async function fetchPostFromGitHub(slug: string): Promise<string> {
  const repo = "hericmendez/git-posts";
  const path = `posts/${slug}.md`;
  const res = await fetch(
    `https://raw.githubusercontent.com/${repo}/main/${path}`,
    { cache: "no-store" } // <- isso força o fetch mais atual possível
  );

  if (!res.ok) {
    throw new Error(`Erro ao buscar o arquivo: ${res.status}`);
  }

  return await res.text();
}
