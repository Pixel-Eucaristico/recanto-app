"use client";

import { useAuth } from "@/features/dashboard/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/app/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="container mx-auto">
        <div className="hero bg-base-100 rounded-lg shadow-xl">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">Dashboard</h1>
              <p className="py-6">Bem-vindo, {user.name || user.email}!</p>
              <p className="text-sm opacity-70">Role: {user.role}</p>
              <div className="card-actions justify-center mt-4">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    // Implementar logout
                  }}
                >
                  Dashboard completo em breve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
