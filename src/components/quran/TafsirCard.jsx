import { useState } from "react"
import { ChevronDown, ChevronUp, BookOpenText } from "lucide-react"
import Card from "../ui/Card"

export default function TafsirCard({ tafsir }) {
  const [expanded, setExpanded] = useState(false)

  if (!tafsir) return null

  return (
    <Card padding="normal">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <BookOpenText size={17} style={{ color: "var(--color-gold)" }} />
          <span
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)", fontSize: "1.05rem" }}
            className="font-semibold"
          >
            Tafsir
          </span>
          {tafsir.source && (
            <span
              className="text-xs px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: "rgba(201,168,76,0.12)",
                color: "var(--color-gold-dark)",
              }}
            >
              {tafsir.source}
            </span>
          )}
        </div>

        {expanded
          ? <ChevronUp size={16} style={{ color: "var(--color-muted)" }} />
          : <ChevronDown size={16} style={{ color: "var(--color-muted)" }} />
        }
      </button>

      {expanded && (
        <div
          className="mt-4 pt-4 text-sm leading-relaxed"
          style={{
            color: "var(--color-ink-light)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {tafsir.text}
        </div>
      )}

      {!expanded && (
        <p className="mt-2 text-xs" style={{ color: "var(--color-muted)" }}>
          Tap to read commentary
        </p>
      )}
    </Card>
  )
}