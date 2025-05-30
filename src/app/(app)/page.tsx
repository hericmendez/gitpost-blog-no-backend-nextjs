"use client"

import { useSessionUser } from "@/hooks/useSessionUser";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const { user } = useSessionUser();
  const owner = localStorage.getItem("git-owner");
  console.log("owner ==> ", owner);
  return (
    <>
      <div className="p-10 overflow-y-auto">
        <h1 className=" text-3xl font-semibold">Olá, {user?.name}!</h1>
        <p className="break-all mt-5">Sobre o que você quer falar hoje?</p>
        <Link href="/editor/new">
          <button className="mt-10 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Criar novo post
          </button>
        </Link>
      </div>
    </>
  );
}
