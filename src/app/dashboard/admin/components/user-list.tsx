// app/dashboard/admin/components/user-list.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Pencil,
  Trash,
  AlertCircle,
  Plus,
  Users as UsersIcon,
  Filter,
  X
} from "lucide-react";
import UserEditModal from "./modal/user-edit-modal";
import UserAddModal from "./modal/user-add-modal";
import { cn } from "@/lib/utils";
import { fluidSize } from "@/lib/utils";
import Toast from "@/components/ui/toast";

type UserType = {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
};

export default function UserList() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedRole]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const usersData = Array.isArray(data) ? data : [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error instanceof Error ? error.message : "Failed to load users");
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (selectedRole === "all") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.role.toLowerCase() === selectedRole.toLowerCase()
      );
      setFilteredUsers(filtered);
    }
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchUsers(); // Refresh list
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleAddSuccess = () => {
    fetchUsers(); // Refresh list
    setIsAddModalOpen(false);
  };

  const deleteUser = async (id: string, name: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    const user = users.find(u => u._id === deleteId);
    if (!user) return;

    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/users/${deleteId}`, { method: "DELETE" });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u._id !== deleteId));
      setFilteredUsers((prev) => prev.filter((u) => u._id !== deleteId));
      setToast({ message: `User "${user.fullName}" deleted successfully`, type: "success" });
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setToast({ message: "Failed to delete user", type: "error" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const roleLower = role.toLowerCase();
    switch (roleLower) {
      case 'admin':
        return "bg-blue-100 text-blue-800 ";
      case 'manager':
        return "bg-purple-100 text-purple-800 ";
      case 'cashier':
        return "bg-green-100 text-green-800 ";
      case 'waiter':
        return "bg-orange-100 text-orange-800 ";
      case 'kitchen':
        return "bg-red-100 text-red-800 ";
      case 'owner':
        return "bg-indigo-100 text-indigo-800 ";
      case 'customer':
        return "bg-gray-100 text-gray-800 ";
      default:
        return "bg-gray-100 text-gray-800 ";
    }
  };

  const getRoleOptions = () => {
    const roles = users.map(user => user.role.toLowerCase());
    const uniqueRoles = Array.from(new Set(roles));

    const roleOptions = [
      { value: "all", label: "All Roles" },
      { value: "admin", label: "Admin" },
      { value: "owner", label: "Owner" },
      { value: "manager", label: "Manager" },
      { value: "cashier", label: "Cashier" },
      { value: "waiter", label: "Waiter" },
      { value: "kitchen", label: "Kitchen" },
      { value: "customer", label: "Customer" }
    ];

    // Only show roles that actually exist in the data
    return roleOptions.filter(option =>
      option.value === "all" || uniqueRoles.includes(option.value)
    );
  };

  const clearFilter = () => {
    setSelectedRole("all");
    setShowFilter(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-fluid-16 h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-fluid-4" />
          <p className="text-gray-500 text-fluid-base">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="flex items-center text-red-600 mb-fluid-4 justify-center">
            <AlertCircle className="w-fluid-5 h-fluid-5 mr-fluid-2" />
            <span className="text-fluid-base">{error}</span>
          </div>
          <button
            onClick={() => fetchUsers()}
            className="px-fluid-4 py-fluid-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-fluid-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border-gray-100 mb-fluid-6 "
        style={{
          borderWidth: fluidSize(1),
          borderRadius: fluidSize(16)
        }}>
        {/* Header */}
        <div className="p-fluid-6 border-b border-gray-100"
          style={{
            borderBottom: fluidSize(1),
          }}>
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-gray-900 text-fluid-lg">List User</h6>
              <div className="text-gray-500 text-fluid-sm mt-fluid-1">
                {selectedRole === "all"
                  ? `Total ${users.length} users`
                  : `${filteredUsers.length} ${selectedRole}${filteredUsers.length !== 1 ? 's' : ''}`
                }
              </div>
            </div>
            <div className="flex items-center gap-fluid-3">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={cn(
                  "flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-fluid-sm border border-gray-200",
                  selectedRole !== "all" && "bg-gray-900 text-white border-gray-900"
                )}
              >
                <Filter className="w-fluid-4 h-fluid-4" />
                <span>Filter</span>
                {selectedRole !== "all" && (
                  <span className="ml-fluid-1 px-fluid-2 py-fluid-0.5 bg-white text-black rounded-full text-fluid-xs">
                    {selectedRole}
                  </span>
                )}
              </button>

              {/* Add User Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-fluid-sm"
              >
                <Plus className="w-fluid-4 h-fluid-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="mt-fluid-4 p-fluid-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-fluid-3">
                <p className="text-gray-700 font-medium text-fluid-sm">Filter by Role</p>
                <button
                  onClick={clearFilter}
                  className="flex items-center gap-fluid-1 text-gray-500 hover:text-gray-700 text-fluid-xs"
                >
                  <X className="w-fluid-3 h-fluid-3" />
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-fluid-2">
                {getRoleOptions().map((role) => (
                  <button
                    key={role.value}
                    onClick={() => {
                      setSelectedRole(role.value);
                      setShowFilter(false);
                    }}
                    className={cn(
                      "px-fluid-3 py-fluid-2 rounded-lg text-fluid-sm transition-colors text-left",
                      selectedRole === role.value
                        ? "bg-gray-900 text-white border border-gray-900"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    )}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-fluid-12 text-center">
              <div className="flex flex-col items-center">
                <UsersIcon className="w-fluid-16 h-fluid-16 text-gray-300 mb-fluid-4" />
                <p className="text-gray-500 mb-fluid-2 text-fluid-lg">
                  {selectedRole === "all" ? "No users found" : `No ${selectedRole}s found`}
                </p>
                <p className="text-gray-400 text-fluid-sm mb-fluid-4">
                  {selectedRole === "all"
                    ? "Add your first user to get started"
                    : `Try changing the filter or add a new ${selectedRole}`
                  }
                </p>
                <div className="flex gap-fluid-3">
                  {selectedRole !== "all" && (
                    <button
                      onClick={clearFilter}
                      className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-fluid-sm"
                    >
                      <X className="w-fluid-4 h-fluid-4" />
                      Clear Filter
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-fluid-sm"
                  >
                    <Plus className="w-fluid-4 h-fluid-4" />
                    Add User
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Username
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Full Name
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Email
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Phone
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Role
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-fluid-4">
                        <span className="font-medium text-gray-900 block text-fluid-sm">
                          {user.username}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-900 text-fluid-sm">
                          {user.fullName}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-600 text-fluid-sm">
                          {user.email}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-600 text-fluid-sm">
                          {user.phone}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span
                          className={cn(
                            "px-fluid-3 py-fluid-1 rounded-full font-medium !text-fluid-sm capitalize",
                            getRoleColor(user.role)
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-fluid-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-fluid-sm"
                            title="Edit"
                          >
                            <Pencil className="w-fluid-3 h-fluid-3" />
                            <span>Edit</span>
                          </button>

                          {user.role.toLowerCase() !== 'admin' && (
                            <button
                              onClick={() => deleteUser(user._id, user.fullName)}
                              className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-fluid-sm"
                              title="Delete"
                            >
                              <Trash className="w-fluid-3 h-fluid-3" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <UserAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Modal */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full shadow-xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-gray-900 text-lg font-bold">
                Delete User
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-600">
                Are you sure you want to delete user <span className="font-bold">"{users.find(u => u._id === deleteId)?.fullName}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border border-gray-300 hover:border-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash className="w-5 h-5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}