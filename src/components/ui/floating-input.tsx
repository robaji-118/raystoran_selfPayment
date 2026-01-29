import React from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export default function FloatingInput({
  label,
  icon,
  className,
  ...props
}: FloatingInputProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}

      <input
        {...props}
        placeholder=" "
        className={cn(
          "peer h-12 w-full border-0 border-b border-gray-300 bg-transparent px-0 pl-8 text-gray-900 focus:border-black focus:outline-none transition-all",
          className
        )}
      />

      <label
        className="
          absolute left-8 top-3 text-gray-500 text-sm pointer-events-none
          transition-all duration-200
          peer-focus:-top-2 peer-focus:text-xs peer-focus:text-black
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-gray-500
          peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs
        "
      >
        {label}
      </label>
    </div>
  );
}
