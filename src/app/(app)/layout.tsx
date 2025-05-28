"use client";

import Header from "@/components/LayoutElements/Header";
import HeaderMobile from "@/components/LayoutElements/HeaderMobile";
import SideNav from "@/components/LayoutElements/SideNav";
import PageWrapper from "@/components/LayoutElements/PageWrapper";
import MarginWidthWrapper from "@/components/LayoutElements/MarginWidthWrapper";
import "@/styles/globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReactNode, FC } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react";

const AppLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  /* 
  useEffect(() => {
    const token = localStorage.getItem("session");

    if (!token) {
      console.log("Token ausente. Redirecionando para login.");
      router.push("/login");
    } else {
      console.log("Token encontrado. Acesso permitido.");
      // Adicione lógica de validação adicional, se necessário
    }
  }, []); */
  return (
    <SessionProvider>
      <ThemeProvider>
        <div className="flex">
          <SideNav />
          <main className="flex-1">
            <MarginWidthWrapper>
              <Header />
              <HeaderMobile />
              <PageWrapper>{children}</PageWrapper>
            </MarginWidthWrapper>
          </main>
        </div>
      </ThemeProvider>{" "}
    </SessionProvider>
  );
};

export default AppLayout;
