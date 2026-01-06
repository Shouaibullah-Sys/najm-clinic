// lib/auth-server.ts
import { betterAuth } from "better-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { client } from "./mongodb";
import { RolePermissions } from "./models/User";

// Get admin email domain from env or use default
const ADMIN_EMAIL_DOMAIN =
  process.env.ADMIN_EMAIL_DOMAIN || "admin.yourdomain.com";

// This is ONLY for server-side use
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  basePath: "/api/auth",

  database: MongoDBAdapter(client, {
    databaseName: "najm-clinic",
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Enable sign-up and automatic sign-in after registration
  },

  googleOAuth: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    enabled:
      !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "staff",
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      permissions: {
        type: "string[]",
        required: false,
        defaultValue: [],
      },
      lastLoginAt: {
        type: "date",
        required: false,
      },
    },
  },

  callbacks: {
    user: async (user: any) => {
      // Set role based on email domain
      if (user.email?.endsWith(`@${ADMIN_EMAIL_DOMAIN}`)) {
        user.role = "admin";
      } else {
        user.role = "staff";
      }

      // Set default permissions based on role (imported from User model)
      const role = user.role as keyof typeof RolePermissions;
      user.permissions = [...RolePermissions[role]];

      user.isActive = true;
      user.lastLoginAt = new Date();

      return user;
    },
  },
});

export const handler = auth.handler;
