"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Toast from "@/components/ui/toast";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
  } | null;
  onSuccess: () => void;
}

export default function UserEditModal({ isOpen, onClose, user, onSuccess }: UserEditModalProps) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    role: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        password: ""
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validation
    if (!form.username.trim() || !form.email.trim() || !form.fullName.trim() || !form.phone.trim()) {
      setError("All fields are required");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        username: form.username,
        email: form.email,
        fullName: form.fullName,
        phone: form.phone,
        role: form.role,
        ...(form.password && { password: form.password })
      };

      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      onSuccess();
      setToast({ message: "User updated successfully", type: "success" });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      setToast({ message: err instanceof Error ? err.message : "Failed to update user", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-fluid-4">
      <div className="bg-white rounded-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-fluid-6 border-b border-gray-100">
          <h2 className="text-gray-900 text-fluid-xl font-bold">Edit User</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-fluid-6 h-fluid-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-fluid-6 space-y-fluid-6">
          {error && (
            <div className="flex items-start gap-fluid-3 p-fluid-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-fluid-5 h-fluid-5 text-red-600 flex-shrink-0 mt-fluid-0.5" />
              <div>
                <p className="text-red-600 font-medium text-fluid-sm">Error</p>
                <p className="text-red-500 text-fluid-xs mt-fluid-1">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-4">
            <div className="space-y-fluid-2">
              <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Username *
              </Label>
              <Input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={loading}
                className={cn(
                  "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                )}
              />
            </div>

            <div className="space-y-fluid-2">
              <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Full Name *
              </Label>
              <Input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                disabled={loading}
                className={cn(
                  "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-4">
            <div className="space-y-fluid-2">
              <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Email Address *
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
                className={cn(
                  "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                )}
              />
            </div>

            <div className="space-y-fluid-2">
              <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Phone Number *
              </Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={loading}
                className={cn(
                  "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                )}
              />
            </div>
          </div>

          <div className="space-y-fluid-2">
            <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
              Password (leave empty to keep current)
            </Label>
            <Input
              type="password"
              placeholder="Enter new password to change"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
              className={cn(
                "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
              )}
            />
          </div>

          <div className="space-y-fluid-2">
            <Label className="text-xs font-bold text-black uppercase tracking-wider ml-1">
              User Role *
            </Label>
            <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })} disabled={loading}>
              <SelectTrigger className="h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="waiter">Waiter</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-gray-100 pt-fluid-6 flex gap-fluid-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={cn(
                "flex-1 px-fluid-6 py-fluid-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-fluid-base",
                loading && "cursor-not-allowed"
              )}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex-1 px-fluid-6 py-fluid-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-fluid-2 text-fluid-base",
                loading && "cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-fluid-5 h-fluid-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-fluid-5 h-fluid-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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