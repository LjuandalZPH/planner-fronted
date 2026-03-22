import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ children, disabled, className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`
        px-5 py-2.5
        rounded-lg
        font-semibold text-sm text-white
        bg-linear-to-br from-blue-500 to-blue-600
        shadow-md shadow-blue-600/30
        transition-all duration-150
        ${disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/40 active:translate-y-0"}
        ${className}
      `}
    >
      {children}
    </button>
  );
}