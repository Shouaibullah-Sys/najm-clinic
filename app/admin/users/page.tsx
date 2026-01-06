// app/admin/users/page.tsx
"use client";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserForm from "./UserForm";
import UserTable from "./UserTable";
import { IUser } from "@/lib/models/User";
import { getUsers } from "@/app/admin/users/users";

export default function AdminUsersPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const { data: users, mutate, error } = useSWR<IUser[]>("users", getUsers);

  const handleRefresh = () => {
    mutate();
    setOpenDialog(false);
    setSelectedUser(null);
  };

  return (
    <div className="container mx-auto py-3 px-2 sm:py-6 lg:py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
          User Management
        </h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              className="w-full sm:w-auto text-xs sm:text-sm"
              onClick={() => setSelectedUser(null)}
              size="sm"
            >
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[500px] lg:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                {selectedUser ? "Edit User" : "Create New User"}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              user={
                selectedUser
                  ? { ...selectedUser, _id: selectedUser._id.toString() }
                  : null
              }
              onSuccess={handleRefresh}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="text-red-500 text-sm text-center py-4">
          Failed to load users
        </div>
      ) : (
        <UserTable
          users={users || []}
          onEdit={(user) => {
            setSelectedUser(user);
            setOpenDialog(true);
          }}
          onRefresh={mutate}
        />
      )}
    </div>
  );
}
