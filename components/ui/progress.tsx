interface ProgressProps {
  value: number;
  max?: number;
}

export function Progress({ value, max = 100 }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#e5e7eb",
        borderRadius: "9999px",
        overflow: "hidden",
        height: "0.75rem",
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          background:
            "linear-gradient(90deg, rgba(96,165,250,1) 0%, rgba(59,130,246,1) 50%, rgba(34,197,94,1) 100%)",
          height: "100%",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

