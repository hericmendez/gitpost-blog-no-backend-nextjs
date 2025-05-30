import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { Octokit } from "@octokit/rest";

import type {
  Session as NextAuthSession,
  Profile as NextAuthProfile,
  Account,
} from "next-auth";

type Session = NextAuthSession & { accessToken?: string; username?: string };
type Profile = NextAuthProfile & { login: string };

const REPO_NAME = "git-posts";

const createRepoIfMissing = async (
  octokit: Octokit,
  owner: string
): Promise<boolean> => {
  try {
    await octokit.repos.get({ owner, repo: REPO_NAME });
    console.log("📦 Repositório já existe");
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      console.log("📦 Repositório não encontrado. Criando...");
      try {
        await octokit.repos.createForAuthenticatedUser({
          name: REPO_NAME,
          description: "Posts do GitBlog",
          private: false,
          auto_init: true,
        });

        const content = `---\ntitle: Primeiro Post\ndate: ${new Date().toISOString()}\n---\n\nEste é o seu primeiro post!`;

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo: REPO_NAME,
          path: "posts/primeiro-post.md",
          message: "Primeiro post criado automaticamente",
          content: Buffer.from(content).toString("base64"),
          branch: "main",
        });

        console.log("✅ Repositório e primeiro post criados");
        return true;
      } catch (createError) {
        console.error("❌ Erro ao criar repositório:", createError);
        return false;
      }
    } else {
      console.error("❌ Erro ao checar existência do repositório:", error);
      return false;
    }
  }
};

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: "repo user" },
      },
      checks: ["none"],
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!account?.access_token || !profile?.login) return false;

      const octokit = new Octokit({ auth: account.access_token });
      const owner = profile.login;

      const success = await createRepoIfMissing(octokit, owner);

      if (!success) {
        console.warn("⚠️ Não foi possível garantir o repositório.");
        return false;
      }

      return true;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.username = token.username as string;
      return session;
    },

    async jwt({ token, account, profile }) {
      if (account?.access_token) token.accessToken = account.access_token;
      if (profile?.login) token.username = profile.login;
      return token;
    },

    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },

  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: { maxAge: 60 * 60 * 24 },
    },
    state: {
      name: "next-auth.state",
      options: { maxAge: 60 * 60 * 24 },
    },
  },
} as NextAuthOptions);

export { handler as GET, handler as POST };
