import { AuthProvider } from "@/features/dashboard/contexts/AuthContext";
import "@/styles/globals.css";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { ThemeProvider } from "@/components/ui/daisyui/theme-controller/theme.provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ThemeProvider
          lightTheme="recanto-light"
          darkTheme="recanto-dark"
          className="min-h-screen"
        >
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </ThemeProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}
