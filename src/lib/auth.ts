import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { Octokit } from "@octokit/rest";

const REPO_NAME = "git-posts";

const createRepoIfMissing = async (octokit: Octokit, owner: string) => {
  try {
    await octokit.repos.get({ owner, repo: REPO_NAME });
    return true;
  } catch (error: any) {
    if (error.status === 404) {
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

      return true;
    }
    return false;
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { scope: "repo user" } },
      checks: ["none"],
    }),
  ],
  callbacks: {
    async signIn(params: { user: any; account: any; profile?: any; email?: any; credentials?: any }) {
      const { account, profile } = params;
      if (!account?.access_token || !profile?.login) return false;
      const octokit = new Octokit({ auth: account.access_token });
      return await createRepoIfMissing(octokit, profile.login);
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken as string;
      session.username = token.username as string;
      return session;
    },
    async jwt({ token, account, profile }: { 
      token: any; 
      user?: any; 
      account?: any; 
      profile?: any; 
      trigger?: "signIn" | "signUp" | "update"; 
      isNewUser?: boolean; 
      session?: any; 
    }) {
      if (account?.access_token) token.accessToken = account.access_token;
      if (profile && typeof profile === "object" && "login" in profile) {
        token.username = profile.login;
      }
      return token;
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
};
