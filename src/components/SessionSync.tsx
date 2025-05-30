
// src/components/SessionSync.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== "undefined" && session?.username) {
      localStorage.setItem("git_owner", session.username);
    }
  }, [session?.username]);

  return null;
}
