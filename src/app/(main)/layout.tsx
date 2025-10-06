import { Navbar } from "@/components/blocks/navbar";

import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="w-full bg-base-100 shadow sticky px-4 top-0 right-0 left-0 z-20">
        <Navbar />
      </header>
      <main className="bg-base-100 flex-1">{children}</main>
      <footer className="w-full bg-base-200 text-base-content py-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Recanto do Amor Misericordioso. Todos os
          direitos reservados.
        </p>
      </footer>
    </>
  );
}
