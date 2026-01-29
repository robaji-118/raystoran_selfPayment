"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";

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
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
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
              <label className="block text-gray-700 font-medium text-fluid-sm">
                Username *
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={loading}
                className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-fluid-base"
              />
            </div>

            <div className="space-y-fluid-2">
              <label className="block text-gray-700 font-medium text-fluid-sm">
                Full Name *
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                disabled={loading}
                className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-fluid-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-4">
            <div className="space-y-fluid-2">
              <label className="block text-gray-700 font-medium text-fluid-sm">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
                className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-fluid-base"
              />
            </div>

            <div className="space-y-fluid-2">
              <label className="block text-gray-700 font-medium text-fluid-sm">
                Phone Number *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={loading}
                className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-fluid-base"
              />
            </div>
          </div>

          <div className="space-y-fluid-2">
            <label className="block text-gray-700 font-medium text-fluid-sm">
              Password (leave empty to keep current)
            </label>
            <input
              type="password"
              placeholder="Enter new password to change"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
              className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-fluid-base"
            />
          </div>

          <div className="space-y-fluid-2">
            <label className="block text-gray-700 font-medium text-fluid-sm">
              User Role *
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              disabled={loading}
              className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-fluid-base"
            >
              <option value="customer">Customer</option>
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen</option>
              <option value="cashier">Cashier</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
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
                "flex-1 px-fluid-6 py-fluid-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-fluid-2 text-fluid-base",
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
    </div>
  );
}