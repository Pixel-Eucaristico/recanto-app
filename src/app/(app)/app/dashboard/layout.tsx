import { AuthProvider } from "@/features/dashboard/contexts/AuthContext";
import "@/styles/globals.css";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
}
