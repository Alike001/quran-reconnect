export default function Card({ children, className = "", padding = "normal", onClick }) {
  const paddings = {
    none:   "",
    small:  "p-4",
    normal: "p-6",
    large:  "p-8",
  }

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border transition-all
        ${paddings[padding]}
        ${onClick ? "cursor-pointer hover:shadow-md" : ""}
        ${className}
      `}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {children}
    </div>
  )
}