'use client';

import React from 'react';
import Link from 'next/link';
import useScroll from "@/hooks/useScroll";
import { cn } from "../../lib/utils";

import HeaderDropdown from "./HeaderDropdown";


export default function Header() {
  const scrolled = useScroll(5);


  return (
    <nav
      className={cn(
        `fixed inset-x-0 top-0 z-30 w-full transition-all border-b border-slate-200`,
        {
          "border-b border-gray-200 bg-white/75 backdrop-blur-lg": scrolled,
        }
      )}
    >
        {/* LOGO */}
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className=" absolute left-5 flex flex-row space-x-3 items-center justify-center"
          >
          <img
            src="/logo_github.png"
              className="h-10 w-10  bg-primary rounded-lg hidden"
            alt='Github Logo'
            width={50}
            height={50}
          ></img>
            <span className="font-bold text-xl text-black dark:text-slate-200 hidden md:block">
              GitBlog - Your Serverless Blog Editor!
            </span>
          </Link>
        </div>

        {/* PROFILE */}
        <div className="flex flex-row-auto">
        <HeaderDropdown />
      </div>
    </nav>
  );
}
