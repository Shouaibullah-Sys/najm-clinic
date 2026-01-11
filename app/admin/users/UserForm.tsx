// app/admin/users/UserForm.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  UserRoleEnum,
  CreateUserSchema,
  UpdateUserSchema,
} from "@/lib/schemas/userSchema";
import { z } from "zod";

// Use UpdateUserSchema for both modes, handle create validation in onSubmit
type UserFormValues = z.infer<typeof UpdateUserSchema>;

interface UserFormProps {
  user?: (Partial<UserFormValues> & { _id?: string }) | null;
  onSuccess: () => void;
}

export default function UserForm({ user, onSuccess }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!user?._id;

  // Use UpdateUserSchema for both create and edit
  const FormSchema = UpdateUserSchema;

  // Create default values
  const getDefaultValues = (): UserFormValues => ({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "", // Always start with empty
    role: user?.role || "staff",
    approved: user?.approved ?? false,
    active: user?.active ?? true,
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(FormSchema) as any, // Cast to bypass type issues
    defaultValues: getDefaultValues(),
  });

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // For create mode, ensure password is provided
      if (!isEditMode && (!data.password || data.password.trim() === "")) {
        throw new Error("Password is required for new users");
      }

      const url = user?._id
        ? `/api/admin/users/${user._id}`
        : "/api/admin/users";

      const method = user?._id ? "PUT" : "POST";

      // Prepare payload - handle password for updates
      const payload: any = { ...data };

      // For updates: remove password if empty, undefined, or just whitespace
      if (isEditMode) {
        if (!payload.password || payload.password.trim() === "") {
          delete payload.password;
        }
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as {
          error?: string;
          message?: string;
          details?: any;
        };

        // Handle validation errors from server
        if (errorData.details) {
          const validationErrors = Object.values(
            errorData.details.fieldErrors || {}
          ).flat();
          throw new Error(validationErrors.join(", ") || "Validation failed");
        }
        throw new Error(
          errorData.error || errorData.message || "Failed to save user"
        );
      }

      toast.success(
        isEditMode ? "User updated successfully" : "User created successfully"
      );
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Full Name</FormLabel>
              <FormControl>
                <Input {...field} className="text-sm sm:text-base" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  className="text-sm sm:text-base"
                  disabled={isEditMode}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Phone</FormLabel>
              <FormControl>
                <Input {...field} className="text-sm sm:text-base" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">
                Password{" "}
                {!isEditMode && <span className="text-red-500">*</span>}
                {isEditMode && (
                  <span className="text-xs text-gray-500 ml-2">
                    (leave empty to keep current)
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  value={field.value || ""}
                  className="text-sm sm:text-base"
                  placeholder={isEditMode ? "••••••••" : "Enter password"}
                />
              </FormControl>
              <div className="text-xs text-gray-500 space-y-1 mt-1">
                <p>Must be at least 8 characters</p>
                <p>
                  Must contain uppercase letter, number, and special character
                </p>
              </div>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UserRoleEnum.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="text-sm sm:text-base"
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="approved"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm sm:text-base">
                    Approved
                  </FormLabel>
                  <div className="text-xs text-gray-500">
                    User can access the system
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm sm:text-base">Active</FormLabel>
                  <div className="text-xs text-gray-500">
                    User account is active
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto text-sm sm:text-base"
        >
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
            ? "Update User"
            : "Create User"}
        </Button>
      </form>
    </Form>
  );
}
