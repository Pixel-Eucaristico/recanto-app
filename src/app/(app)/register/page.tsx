"use client";

import React from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { HeartHandshake } from "lucide-react";
import ThemeController from "@/components/ui/daisyui/theme-controller";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-base-300 p-4">
      <div className="absolute right-4 top-4">
        <ThemeController />
      </div>
      <div className="w-full flex flex-col items-center justify-center max-w-md text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <HeartHandshake className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary/80">Recanto Digital</h1>
            <p className="text-primary/50">do Amor Misericordioso</p>
          </div>
        </div>

        <div className="card w-96 bg-base-100 shadow-xl p-8 pt-0">
          <div className="card-body">
            <h2 className="card-title justify-center mb-4">Cadastrar</h2>
            <p className="text-lg italic mb-4">
              "Não devias tu, igualmente, ter compaixão do teu companheiro, como eu também tive compaixão de ti?"
            </p>
            <p className="mt-2 font-semibold text-sm mb-4">- Mateus 18:33</p>
          </div>
          <div className="card-actions justify-center">
            <LoginForm isRegister={true} />
          </div>
          <p className="text-xs mt-4">
            Já possui uma conta? <Link href="/app/login" className="text-primary hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}