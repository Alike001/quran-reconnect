import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, Bookmark, PenLine, Trash2 } from "lucide-react"

import { getBookmarks, getReflections, deleteReflection } from "../services/userApi"
import { useStreak } from "../hooks/useStreak"

import StreakCard from "../components/dashboard/StreakCard"
import DashboardCard from "../components/dashboard/DashboardCard"
import ReflectionForm from "../components/dashboard/ReflectionForm"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import EmptyState from "../components/ui/EmptyState"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"

export default function Dashboard() {
  const navigate = useNavigate()
  const { streak, loading: streakLoading } = useStreak()

  const [bookmarks, setBookmarks] = useState([])
  const [reflections, setReflections] = useState([])
  const [loading, setLoading] = useState(true)

  // Load last-read progress from localStorage (set by Reader)
  const lastRead = (() => {
    try {
      const saved = localStorage.getItem("qr_last_read")
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })()

  // Load bookmarks and reflections
  useEffect(() => {
    Promise.all([getBookmarks(), getReflections()])
      .then(([bm, ref]) => {
        setBookmarks(bm)
        setReflections(ref)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Called by ReflectionForm after a successful save
  function handleReflectionSaved(newEntry) {
    setReflections((prev) => [newEntry, ...prev])
  }

  // Delete a reflection
  async function handleDeleteReflection(id) {
    try {
      await deleteReflection(id)
      setReflections((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // ignore error
    }
  }

  function formatDate(isoString) {
    if (!isoString) return ""
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    })
  }

  if (loading || streakLoading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16">
        <LoadingSpinner message="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 flex flex-col gap-8">

      <div>
        <h1
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
          className="text-3xl font-bold mb-1"
        >
          Your Dashboard
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Track your Quran habit and reflections
        </p>
      </div>

      <StreakCard streak={streak} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          icon="📖"
          label="Last Read"
          value={lastRead ? `${lastRead.surahName}` : "Not started"}
          subValue={lastRead ? `Ayah ${lastRead.surah}:${lastRead.ayah}` : "Go read your first ayah"}
          linkTo="/reader"
          linkLabel="Continue reading"
          accent
        />
        <DashboardCard
          icon="🔖"
          label="Bookmarks"
          value={bookmarks.length}
          subValue={bookmarks.length === 1 ? "saved ayah" : "saved ayahs"}
        />
        <DashboardCard
          icon="✍️"
          label="Reflections"
          value={reflections.length}
          subValue={reflections.length === 1 ? "entry written" : "entries written"}
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Bookmark size={18} style={{ color: "var(--color-gold)" }} />
          <h2
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
            className="text-2xl font-semibold"
          >
            Saved Ayahs
          </h2>
        </div>

        {bookmarks.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="No bookmarks yet"
            description="While reading, tap the bookmark icon on any ayah to save it here."
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate("/reader")}>
                Go to Reader
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {bookmarks.map((bm) => (
              <Card key={`${bm.surah}:${bm.ayah}`} padding="normal" className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
                      className="font-semibold"
                    >
                      {bm.surahName}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-lg"
                      style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "var(--color-gold-dark)" }}
                    >
                      {bm.surah}:{bm.ayah}
                    </span>
                  </div>
  
                  <button
                    onClick={() => navigate("/reader")}
                    className="text-xs flex-shrink-0"
                    style={{ color: "var(--color-teal)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Read →
                  </button>
                </div>

                {bm.arabic && (
                  <p
                    className="arabic-text text-right text-xl leading-loose"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {bm.arabic}
                  </p>
                )}

                {bm.savedAt && (
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    Saved {formatDate(bm.savedAt)}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <PenLine size={18} style={{ color: "var(--color-teal)" }} />
          <h2
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
            className="text-2xl font-semibold"
          >
            My Reflections
          </h2>
        </div>

        <ReflectionForm
          currentAyahRef={lastRead ? `${lastRead.surahName} ${lastRead.surah}:${lastRead.ayah}` : ""}
          onSaved={handleReflectionSaved}
        />

        {reflections.length === 0 ? (
          <EmptyState
            icon="✍️"
            title="No reflections yet"
            description="Write your first reflection above. Your thoughts are your personal Quran journal."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {reflections.map((r) => (
              <Card key={r.id} padding="normal" className="flex flex-col gap-2">
               
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    {r.ayahRef && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-lg w-fit"
                        style={{ backgroundColor: "rgba(45,125,111,0.10)", color: "var(--color-teal)" }}
                      >
                        {r.ayahRef}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                      {formatDate(r.createdAt)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteReflection(r.id)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer" }}
                    aria-label="Delete reflection"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-ink-light)", fontFamily: "var(--font-body)" }}
                >
                  {r.text}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
      
      <Card padding="normal" className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <BookOpen size={20} style={{ color: "var(--color-teal)" }} />
          <div>
            <p style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }} className="font-semibold">
              Ready to read?
            </p>
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              {lastRead
                ? `Continue from ${lastRead.surahName} ${lastRead.surah}:${lastRead.ayah}`
                : "Start your first reading session"}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/reader")} size="sm">
          Go to Reader →
        </Button>
      </Card>

    </div>
  )
}