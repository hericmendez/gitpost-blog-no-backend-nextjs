// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { Octokit } from "@octokit/rest";
import type { JWT } from "next-auth/jwt";
import type {
  Session as NextAuthSession,
  Profile as NextAuthProfile,
  Account,
} from "next-auth";

type Session = NextAuthSession & { accessToken?: string; username?: string };
type Profile = NextAuthProfile & { login: string };

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({
      account,
      profile,
    }: {
      account: Account | null;
      profile?: Profile;
    }) {
      if (!account?.access_token || !profile?.login) return false;

      const octokit = new Octokit({ auth: account.access_token });
      const owner = profile.login;
      const repo = "git-posts";

      try {
        await octokit.repos.get({ owner, repo });
        console.log("Repositório já existe");
      } catch (error: any) {
        if (error.status === 404) {
          console.log("Criando repositório git-posts para o usuário...");
          await octokit.repos.createForAuthenticatedUser({
            name: repo,
            description: "Posts do PostPuppy",
            private: false,
            auto_init: true,
          });

          const content = `---\ntitle: Primeiro Post\ndate: ${new Date().toISOString()}\n---\n\nEste é o seu primeiro post!`;
          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: "posts/primeiro-post.md",
            message: "Primeiro post criado automaticamente",
            content: Buffer.from(content).toString("base64"),
            branch: "main",
          });
        } else {
          console.error("Erro ao verificar/criar repositório:", error);
          return false;
        }
      }

      return true;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken as string;
      session.username = token.username as string;
      return session;
    },

    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account?: Account | null;
      profile?: Profile;
    }) {
      console.log("JWT Callback:", { token, account, profile });
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (profile?.login) {
        token.username = profile.login; // <- Captura o login do GitHub
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
} as NextAuthOptions);

export { handler as GET, handler as POST };
