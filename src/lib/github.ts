export async function fetchPostFromGitHub(slug: string): Promise<string> {
  const owner = localStorage.getItem("git-owner");
  console.log("owner ==> ", owner);
  const repo = "git-posts";
  const path = `posts/${slug}.md`;
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`,
      { cache: "no-store" } // <- isso força o fetch mais atual possível
    );

    return await res.text();
  } catch (error) {
    throw new Error(`Erro ao buscar o arquivo: ${error}`);
  }
}
("");