// src/hooks/useSessionUser.ts
"use client"
import { useSession } from "next-auth/react"
import { Session } from "next-auth"

// Extend Session type to include accessToken if needed
declare module "next-auth" {
  interface Session {
    accessToken?: string
    username?: string
  }
}

export function useSessionUser() {
  const { data: session, status } = useSession()

  return {
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    accessToken: session?.accessToken,
    username: session?.username,
    user: session?.user,
  }
}
