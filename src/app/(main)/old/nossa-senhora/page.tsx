import { ThemeProvider } from "@/components/ui/daisyui/theme-controller";
import OurLadyPage from "@/features/our-lady/OurLadyPage";

export default function NossaSenhoraPage() {
  return (
    <ThemeProvider
      lightTheme={"nossa-senhora-light"}
      darkTheme={"nossa-senhora-dark"}
      className="h-full flex-1"
    >
      <OurLadyPage />
    </ThemeProvider>
  );
}
