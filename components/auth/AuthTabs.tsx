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
  const redirectTo = redirect || searchParams.get("redirect") || "/dashboard";

  return (
    <div className="space-y-6">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login" className="flex items-center space-x-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            <span>Login</span>
          </TabsTrigger>
          <TabsTrigger value="register" className="flex items-center space-x-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span>Register</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-6">
          <div className="space-y-1 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm redirect={redirectTo} />
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <div className="space-y-1 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Create Account
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Register to start managing your glass business
            </p>
          </div>
          <RegisterForm />
        </TabsContent>
      </Tabs>

      {/* Demo Credentials */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          Demo Credentials
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Admin Account
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Email: admin@glass.com
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Password: Admin@123
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Staff Account
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Email: staff@glass.com
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Password: Staff@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
