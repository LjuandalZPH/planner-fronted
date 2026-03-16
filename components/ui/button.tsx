import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        padding: "0.5rem 1rem",
        borderRadius: "0.5rem",
        border: "none",
        cursor: "pointer",
        backgroundColor: "#2563eb",
        color: "white",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

