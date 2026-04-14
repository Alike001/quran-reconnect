import { Flame } from "lucide-react"
import Card from "../ui/Card"

export default function StreakCard({ streak }) {
  if (!streak) return null

  const isActive = streak.current > 0

  return (
    <Card padding="large" className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: isActive
              ? "rgba(201,168,76,0.15)"
              : "rgba(0,0,0,0.05)",
          }}
        >
          <Flame
            size={22}
            style={{ color: isActive ? "var(--color-gold)" : "var(--color-muted)" }}
            fill={isActive ? "rgba(201,168,76,0.4)" : "none"}
          />
        </div>
        <div>
          <p
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
            className="font-semibold text-lg leading-none mb-1"
          >
            Reading Streak
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            {isActive ? "Keep going — you're on a roll!" : "Start reading to begin your streak."}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span
          style={{
            fontFamily: "var(--font-heading)",
            color: isActive ? "var(--color-gold)" : "var(--color-muted)",
            fontSize: "3.5rem",
            lineHeight: 1,
            fontWeight: 700,
          }}
        >
          {streak.current}
        </span>
        <span className="text-base pb-1" style={{ color: "var(--color-muted)" }}>
          {streak.current === 1 ? "day" : "days"}
        </span>
      </div>

      <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />

      <div className="flex gap-6">
        <div className="flex flex-col gap-0.5">
          <span
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
            className="text-xl font-semibold"
          >
            {streak.longest ?? 0}
          </span>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            Longest streak
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
            className="text-xl font-semibold"
          >
            {streak.totalDaysRead ?? 0}
          </span>
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            Total days read
          </span>
        </div>
      </div>
    </Card>
  )
}