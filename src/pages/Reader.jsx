export default function Reader() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16 text-center">
      <p
        className="arabic-text mb-4"
        style={{ color: "var(--color-teal)", fontSize: "2rem" }}
      >
        ٱقْرَأْ
      </p>
      <h1
        style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
        className="text-4xl font-bold mb-3"
      >
        Ayah Reader
      </h1>
      <p style={{ color: "var(--color-muted)" }}>
        Coming in Stage 3 — Quran Content API integration.
      </p>
    </div>
  )
}