import { ReactNode } from "react";
import { LayoutWithTheme } from "./LayoutWithTheme";

export default function Layout({ children }: { children: ReactNode }) {
  return <LayoutWithTheme>{children}</LayoutWithTheme>;
}
