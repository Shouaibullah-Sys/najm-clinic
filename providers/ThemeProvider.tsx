// provider/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const themes = [
    "light",
    "dark",
    "blue", // Professional blue theme
    "glass", // Custom glass management theme
    "high-contrast",
  ];

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      themes={themes}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// Optional: Custom theme configuration
export const themeConfig = {
  glass: {
    primary: "#0ea5e9", // Sky blue for glass theme
    secondary: "#1e40af", // Deep blue
    accent: "#06b6d4", // Cyan
    background: "#f8fafc", // Light background
    text: "#0f172a", // Dark text
  },
  blue: {
    primary: "#2563eb",
    secondary: "#1d4ed8",
    accent: "#3b82f6",
    background: "#eff6ff",
    text: "#1e3a8a",
  },
};
