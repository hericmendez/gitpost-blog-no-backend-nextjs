"use client"

import { useSessionUser } from "@/hooks/useSessionUser";

export default function Home() {
  const { username, user } = useSessionUser();
  console.log("user ==> ", username);

  return (
    <>
      <div className="p-2 overflow-y-auto">
        <h1 className=" text-xl font-semibold">Posts</h1>
        <p className="break-all"> </p>
      </div>
    </>
  );
}
