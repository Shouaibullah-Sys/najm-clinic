// app/providers.tsx
"use client";

import { ReactNode } from "react";
import AuthProvider from "@/providers/AuthProvider";
import ReactQueryProvider from "@/providers/RectQueryProvider";
import CustomSessionProvider from "@/providers/SessionProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import GlassStoreProvider from "@/providers/GlassStoreProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <CustomSessionProvider>
            <GlassStoreProvider>{children}</GlassStoreProvider>
          </CustomSessionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}
