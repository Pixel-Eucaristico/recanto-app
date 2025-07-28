import { ThemeProvider } from "@/components/ui/daisyui/theme-controller";
import NossaSenhoraPage from "@/features/nossa-senhora/NossaSenhoraPage";

export default function InfograficoPage() {
  return (
    <ThemeProvider
      lightTheme={"nossa-senhora-light"}
      darkTheme={"nossa-senhora-dark"}
      className="h-full flex-1"
    >
      <NossaSenhoraPage />
    </ThemeProvider>
  );
}
