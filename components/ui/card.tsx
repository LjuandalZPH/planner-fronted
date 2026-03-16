import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <section
      style={{
        borderRadius: "0.75rem",
        border: "1px solid #e5e7eb",
        padding: "1rem",
        boxShadow: "0 10px 15px -3px rgba(15,23,42,0.1)",
        background: "white",
      }}
    >
      {title && <h2 style={{ marginBottom: "0.5rem" }}>{title}</h2>}
      {children}
    </section>
  );
}

