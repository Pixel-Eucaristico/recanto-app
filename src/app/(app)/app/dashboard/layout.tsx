import { AuthProvider } from "@/features/dashboard/contexts/AuthContext";
import "@/styles/globals.css";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { DashboardThemeProvider } from "./DashboardThemeProvider";
// Bootstrap do registry de plugins de aula (auto-registra ao importar)
import "@/application/lesson/registerAllPlugins";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DashboardThemeProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </DashboardThemeProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}
