// components/auth/AuthTabs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginFrom";
import RegisterForm from "./RegisterForm";
import { useSearchParams } from "next/navigation";

interface AuthTabsProps {
  redirect?: string;
}

export default function AuthTabs({ redirect }: AuthTabsProps) {
  const searchParams = useSearchParams();
  // Use the redirect prop if provided, otherwise get it from search params
  const redirectTo = redirect || searchParams.get("redirect") || "/dashboard";

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <LoginForm redirect={redirectTo} />
      </TabsContent>

      <TabsContent value="register">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
}
