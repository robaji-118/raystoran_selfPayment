"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Loader2, AlertCircle } from "lucide-react";
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

interface UserAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserAddModal({ isOpen, onClose, onSuccess }: UserAddModalProps) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phone: "",
        role: "customer",
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.username.trim() || !form.email.trim() || !form.password.trim() ||
      !form.fullName.trim() || !form.phone.trim()) {
      setError("All fields are required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add user");
      }

      onSuccess();
      setToast({ message: "User created successfully", type: "success" });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
      setToast({ message: err instanceof Error ? err.message : "Failed to add user", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-fluid-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-fluid-6 border-b border-gray-100">
          <div className="flex items-center gap-fluid-3">
            <div className="p-fluid-2 bg-black rounded-lg">
              <UserPlus className="w-fluid-6 h-fluid-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 text-fluid-xl font-bold">Add New User</h2>
              <p className="text-gray-500 text-fluid-sm mt-fluid-1">
                Create a new user account for the system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-fluid-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-fluid-5 h-fluid-5 text-gray-400" />
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

          {/* Username and Full Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-4">
            <div className="space-y-fluid-2">
              <Label htmlFor="username" className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={loading}
                className={cn(
                  "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                )}
              />
            </div>

            <div className="space-y-fluid-2">
              <Label htmlFor="fullName" className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                disabled={loading}
                className={cn(
                  "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                )}
              />
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-4">
            <div className="space-y-fluid-2">
              <Label htmlFor="email" className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
                className={cn(
                  "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                )}
              />
            </div>

            <div className="space-y-fluid-2">
              <Label htmlFor="phone" className="text-xs font-bold text-black uppercase tracking-wider ml-1">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08123456789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={loading}
                className={cn(
                  "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
                )}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-fluid-2">
            <Label htmlFor="password" className="text-xs font-bold text-black uppercase tracking-wider ml-1">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
              className={cn(
                "h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-300"
              )}
            />
            <p className="text-gray-500 text-fluid-xs">
              Password must be at least 6 characters long
            </p>
          </div>

          {/* Role */}
          <div className="space-y-fluid-2">
            <Label htmlFor="role" className="text-xs font-bold text-black uppercase tracking-wider ml-1">
              User Role <span className="text-red-500">*</span>
            </Label>
            <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })} disabled={loading}>
              <SelectTrigger className="h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer - Browse and order menu</SelectItem>
                <SelectItem value="waiter">Waiter - Deliver orders</SelectItem>
                <SelectItem value="kitchen">Kitchen - Cook orders</SelectItem>
                <SelectItem value="cashier">Cashier - Process payments</SelectItem>
                <SelectItem value="owner">Owner - Business analytics</SelectItem>
                <SelectItem value="admin">Admin - Full system access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-fluid-3 pt-fluid-4 border-t border-gray-100">
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-fluid-5 h-fluid-5" />
                  <span>Create User</span>
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