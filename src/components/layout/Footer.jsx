import { Link } from "react-router-dom"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
      className="mt-auto"
    >
      <div className="max-w-4xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-2">
          <span className="arabic-text text-xl leading-none" style={{ color: "var(--color-teal)" }}>ق</span>
          <span style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }} className="font-semibold">
            QuranReconnect
          </span>
        </div>

        <p className="text-sm text-center" style={{ color: "var(--color-muted)" }}>
          Built for the Quran Foundation Ramadan 2026 Hackathon
        </p>

        <div className="flex items-center gap-4 text-sm" style={{ color: "var(--color-muted)" }}>
          <Link to="/reader" className="hover:underline" style={{ color: "var(--color-muted)" }}>Read</Link>
          <Link to="/dashboard" className="hover:underline" style={{ color: "var(--color-muted)" }}>Dashboard</Link>
          <span>© {year}</span>
        </div>
      </div>
    </footer>
  )
}