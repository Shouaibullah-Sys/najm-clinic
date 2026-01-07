// app/login/page.tsx
import AuthTabs from "@/components/auth/AuthTabs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Glass Management System",
  description: "Login to access the glass business management system",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
            <svg
              className="w-12 h-12 text-blue-600 dark:text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Glass Management System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your glass business efficiently
          </p>
        </div>
        {/* Auth Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <AuthTabs />
          {/* Features Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Features
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Glass Inventory</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Order Management</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Daily Records</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Expense Tracking</span>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} Glass Management System. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
