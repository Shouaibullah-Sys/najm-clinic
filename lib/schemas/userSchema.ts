// lib/schemas/userSchema.ts
import { z } from "zod";

export const UserRoleEnum = ["admin", "staff"] as const;
export type UserRole = (typeof UserRoleEnum)[number];

// Base schema with common fields
const BaseUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[0-9+()\- ]+$/, "Invalid phone number format"),
  role: z.enum(UserRoleEnum),
  approved: z.boolean().default(false),
  active: z.boolean().default(true),
});

// Schema for creating users (password required)
export const CreateUserSchema = BaseUserSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[!@#$%^&*]/, "Must contain at least one special character"),
});

// Schema for updating users (password optional)
export const UpdateUserSchema = BaseUserSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[!@#$%^&*]/, "Must contain at least one special character")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

// Schema for user login
export const LoginUserSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Keep the original for backward compatibility
export const UserSchema = CreateUserSchema;

export type UserFormValues = z.infer<typeof UserSchema>;
export type CreateUserFormValues = z.infer<typeof CreateUserSchema>;
export type UpdateUserFormValues = z.infer<typeof UpdateUserSchema>;
export type LoginFormValues = z.infer<typeof LoginUserSchema>;
