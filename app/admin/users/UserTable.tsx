// app/admin/users/UserTable.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IUser } from "@/lib/models/User";
import { deleteUser } from "@/app/admin/users/users";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { EditIcon, TrashIcon, MoreVerticalIcon } from "@/components/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserTable({
  users,
  onEdit,
  onRefresh,
}: {
  users: IUser[];
  onEdit: (user: IUser) => void;
  onRefresh: () => void;
}) {
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        toast.success("User deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium max-w-[100px] sm:max-w-none truncate">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="max-w-[120px] sm:max-w-none truncate">
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="hidden sm:table-cell">{row.original.phone}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="hidden md:table-cell">
          <Badge variant="secondary">{row.original.role.toUpperCase()}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "approved",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.approved ? "default" : "secondary"}>
          {row.original.approved ? "Approved" : "Pending"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-1 sm:space-x-2">
          {/* Mobile dropdown menu */}
          <div className="block sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <EditIcon className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(row.original._id.toString())}
                  className="text-red-600"
                >
                  <TrashIcon className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop buttons */}
          <div className="hidden sm:flex space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(row.original)}
              className="h-8 px-2 sm:px-3"
            >
              <EditIcon className="h-3 w-3 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(row.original._id.toString())}
              className="h-8 px-2 sm:px-3"
            >
              <TrashIcon className="h-3 w-3 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <DataTable columns={columns} data={users} searchKey="name" />
      </div>
    </div>
  );
}
