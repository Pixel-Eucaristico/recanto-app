'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/domains/auth/services/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export default function AppHomePage() {
  const router = useRouter();

  // Verifica se já está logado e redireciona apropriadamente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/app/dashboard");
      } else {
        router.replace("/app/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <span className="loading loading-spinner text-primary"></span>
    </div>
  );
}
