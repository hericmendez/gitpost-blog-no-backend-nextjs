/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BASE_URL: process.env.BASE_URL,
    GITHUB_REPO_OWNER: process.env.GITHUB_REPO_OWNER,
    GITHUB_REPO_NAME: process.env.GITHUB_REPO_NAME,
    GITHUB_REPO_BRANCH: process.env.GITHUB_REPO_BRANCH,

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_APP_TOKEN: process.env.GITHUB_APP_TOKEN,
    GITHUB_APP_TOKEN_READONLY: process.env.GITHUB_APP_TOKEN_READONLY,
    GITHUB_APP_TOKEN_READONLY_GIGI: process.GITHUB_APP_TOKEN_READONLY_GIGI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
