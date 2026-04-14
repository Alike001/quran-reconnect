import Card from "../ui/Card"

export default function AyahCard({ ayah, rightAction }) {
  if (!ayah) return null

  return (
    <Card padding="large" className="flex flex-col gap-6">

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)", fontSize: "1.25rem" }}
            className="font-semibold"
          >
            {ayah.surahName}
          </span>
          <span
            className="text-xs font-medium px-2 py-1 rounded-lg w-fit"
            style={{
              backgroundColor: "rgba(201,168,76,0.15)",
              color: "var(--color-gold-dark)",
            }}
          >
            {ayah.surah}:{ayah.ayah}
          </span>
        </div>

        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
      </div>

      <div
        className="arabic-text text-right leading-loose"
        style={{
          color: "var(--color-ink)",
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: "1.5rem",
        }}
      >
        {ayah.arabic}
      </div>

      <p
        className="text-base leading-relaxed"
        style={{
          color: "var(--color-ink-light)",
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
        }}
      >
        "{ayah.translation}"
      </p>

      {(ayah.juz || ayah.revelationType) && (
        <div className="flex items-center gap-4 flex-wrap">
          {ayah.juz && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              Juz {ayah.juz}
            </span>
          )}
          {ayah.revelationType && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              {ayah.revelationType}
            </span>
          )}
        </div>
      )}
    </Card>
  )
}