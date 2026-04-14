import { useNavigate } from "react-router-dom"
import Card from "../ui/Card"

export default function DashboardCard({
  icon,
  label,
  value,
  subValue,
  linkTo,
  linkLabel = "View",
  accent = false,
}) {
  const navigate = useNavigate()

  return (
    <Card
      padding="normal"
      className="flex flex-col gap-3"
      onClick={linkTo ? () => navigate(linkTo) : undefined}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
          {label}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span
          style={{
            fontFamily: "var(--font-heading)",
            color: accent ? "var(--color-teal)" : "var(--color-ink)",
            fontSize: "1.5rem",
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {value}
        </span>
        {subValue && (
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            {subValue}
          </span>
        )}
      </div>

      {linkTo && (
        <span
          className="text-xs font-medium"
          style={{ color: "var(--color-teal)" }}
        >
          {linkLabel} →
        </span>
      )}
    </Card>
  )
}