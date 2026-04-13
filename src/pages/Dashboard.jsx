export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16 text-center">
      <span className="text-5xl block mb-4">📊</span>
      <h1
        style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
        className="text-4xl font-bold mb-3"
      >
        Your Dashboard
      </h1>
      <p style={{ color: "var(--color-muted)" }}>
        Coming in Stage 4 — User API integration.
      </p>
    </div>
  )
}