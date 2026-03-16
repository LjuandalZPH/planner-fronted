interface LevelBadgeProps {
  level: number;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <span
      style={{
        padding: "0.25rem 0.75rem",
        borderRadius: "9999px",
        background:
          "linear-gradient(135deg, rgba(251,191,36,1) 0%, rgba(245,158,11,1) 40%, rgba(217,119,6,1) 100%)",
        color: "#111827",
        fontWeight: 700,
        fontSize: "0.875rem",
      }}
    >
      Nivel {level}
    </span>
  );
}

