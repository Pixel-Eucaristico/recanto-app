import { AuthProvider } from "@/features/dashboard/contexts/AuthContext";
import "@/styles/globals.css";
import Sidebar from "@/features/dashboard/components/Sidebar";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { DevRoleSelector } from "@/components/dev/DevRoleSelector";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {children}
          </main>
        </div>
        <DevRoleSelector />
      </ProtectedRoute>
    </AuthProvider>
  );
}
