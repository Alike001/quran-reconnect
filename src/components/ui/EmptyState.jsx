export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      {icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ backgroundColor: "var(--color-border)" }}
        >
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h3
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
          className="text-xl font-semibold"
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm max-w-xs" style={{ color: "var(--color-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}