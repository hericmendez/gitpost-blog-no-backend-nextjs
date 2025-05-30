import { useSessionUser } from "@/hooks/useSessionUser";
import { LogOut, Sun, Moon } from "lucide-react";
import { signOut } from "next-auth/react";
import React, { useEffect, useRef, useState, ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "./ThemeToggle";


const HeaderDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, username } = useSessionUser();

  console.log("user ==> ", { ...user, username });
  useEffect(() => {
    username && localStorage.setItem("git-owner", username);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("git-owner");
    signOut({ callbackUrl: "/login" });
  };
  const { theme, setTheme } = useTheme();
  const handleThemeTogglee = (): void => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-2 rounded-full"
      >
        <div className="h-10 w-10 rounded-full border-2 border-slate-400 flex items-center justify-center text-lg ">
          <img
            className="rounded-full"
            src={user?.image || "/user.png"}
            alt=""
          />
        </div>
      </button>
      {open && (
        <div className="absolute right-0 rounded-sm  shadow-2xl bg-white dark:bg-zinc-800 text-slate-300  min-w-[200px] z-10 mt-1 p-2">
          <div className="flex flex-col justify-center align-center text-center p-2">
            <img
              className="rounded-full w-[66%] mx-auto "
              src={user?.image || "/user.png"}
              alt=""
            />
            <div className="mt-4">
              <p className="text-white font-bold text-xl">{user?.name}</p>
              <sup className="text-lg">(aka {username})</sup>
              <p className="mb-3">{user?.email}</p>
            </div>
          </div>
          <hr className="mb-2" />
          <button
            onClick={handleThemeTogglee}
            className=" flex flex-row w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
          >
            {theme === "dark" ? (
              <>
                <Moon /> &nbsp;Tema: Escuro
              </>
            ) : (
              <>
                <Sun /> &nbsp;Tema: Claro
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className=" flex flex-row w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700"
          >
            <LogOut /> &nbsp;Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default HeaderDropdown;
