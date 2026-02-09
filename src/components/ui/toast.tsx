// components/ui/toast.tsx
"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
}

export default function Toast({
    message,
    type = "info",
    duration = 3000,
    onClose
}: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const styles = {
        success: "bg-green-500 border-2 border-green-600 text-white shadow-lg",
        error: "bg-red-500 border-2 border-red-600 text-white shadow-lg",
        info: "bg-blue-500 border-2 border-blue-600 text-white shadow-lg"
    };

    const iconStyles = {
        success: "text-white",
        error: "text-white",
        info: "text-white"
    };

    return (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in">
            <div className={`${styles[type]} rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md flex items-center gap-3`}>
                <div className={iconStyles[type]}>
                    {icons[type]}
                </div>
                <p className="flex-1 font-medium text-sm">{message}</p>
                <button
                    onClick={onClose}
                    className="hover:opacity-70 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
