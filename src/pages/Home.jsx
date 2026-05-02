import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Play, Pause, Loader, Sparkles } from "lucide-react"

import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import { getAyah } from "../services/contentApi"
import { getDailyAyah } from "../config"
import { useProgress } from "../hooks/useProgress"

const FEATURES = [
  {
    icon: "🔥",
    title: "Streak Tracker",
    description: "Build a consistent habit. Your streak grows every day you read.",
  },
  {
    icon: "🔖",
    title: "Bookmarks",
    description: "Save ayahs that move you. Return to them anytime.",
  },
  {
    icon: "✍️",
    title: "Reflections",
    description: "Write a short reflection on what you read. Build a personal journal.",
  },
]

function DailyAyahCard() {
  const navigate = useNavigate()
  const { markRead } = useProgress()
  const dailyMeta = useMemo(() => getDailyAyah(), [])

  const [verse, setVerse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)

  useEffect(() => {
    let active = true

    getAyah(dailyMeta.surah, dailyMeta.ayah)
      .then((data) => {
        if (!active) return
        setVerse(data)
      })
      .catch(() => {
        if (!active) return
        setError("Could not load today's verse.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [dailyMeta.surah, dailyMeta.ayah])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (audio) audio.pause()
    }
  }, [])

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    []
  )

  function togglePlay() {
    if (!verse?.audioUrl) return
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    setAudioLoading(true)
    audio
      .play()
      .then(() => {
        setIsPlaying(true)
        setAudioLoading(false)
      })
      .catch(() => {
        setAudioLoading(false)
      })
  }

  function handleReadSurah() {
    if (!verse) return
    markRead(verse.surah, verse.ayah, verse.surahName || dailyMeta.surahName)
    navigate(`/reader?surah=${verse.surah}&ayah=${verse.ayah}`)
  }

  return (
    <Card padding="large" className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: "var(--color-gold)" }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-gold-dark)", letterSpacing: "0.08em" }}
          >
            Verse of the Day
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
          {today}
        </span>
      </div>

      {loading && (
        <div className="py-6 text-center text-sm" style={{ color: "var(--color-muted)" }}>
          Loading today's verse...
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-center" style={{ color: "#C0392B" }}>
          {error}
        </p>
      )}

      {!loading && !error && verse && (
        <>
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <span
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
              className="font-semibold text-lg"
            >
              {verse.surahName || dailyMeta.surahName} {verse.surah}:{verse.ayah}
            </span>
            {dailyMeta.note && (
              <span className="text-xs italic" style={{ color: "var(--color-muted)" }}>
                {dailyMeta.note}
              </span>
            )}
          </div>

          <p
            className="arabic-text text-right leading-loose"
            style={{ color: "var(--color-ink)", fontSize: "1.85rem" }}
            translate="no"
          >
            {verse.arabic}
          </p>

          {verse.translation && (
            <p
              className="text-base leading-relaxed text-center"
              style={{
                color: "var(--color-ink-light)",
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
              }}
            >
              “{verse.translation}”
            </p>
          )}

          {verse.audioUrl && (
            <audio
              ref={audioRef}
              src={verse.audioUrl}
              onEnded={() => setIsPlaying(false)}
              preload="none"
            />
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-center pt-1">
            {verse.audioUrl && (
              <Button variant="secondary" onClick={togglePlay} disabled={audioLoading}>
                {audioLoading ? (
                  <>
                    <Loader size={15} className="animate-spin" /> Loading
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause size={15} fill="currentColor" /> Pause
                  </>
                ) : (
                  <>
                    <Play size={15} fill="currentColor" /> Listen
                  </>
                )}
              </Button>
            )}

            <Button onClick={handleReadSurah}>
              Read this Surah <ArrowRight size={15} />
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-5">
      <section className="pt-16 pb-10 text-center flex flex-col items-center gap-5">
        <p
          className="arabic-text"
          style={{ color: "var(--color-teal)", fontSize: "2rem" }}
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>

        <h1
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
          className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl"
        >
          Stay Connected to the Quran — Every Day
        </h1>

        <p
          className="text-lg max-w-xl leading-relaxed"
          style={{ color: "var(--color-muted)" }}
        >
          Ramadan ends, but your connection doesn't have to. Build a daily Quran
          habit with guided reading, reflections, and a streak that keeps you going.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-1">
          <Button size="lg" onClick={() => navigate("/reader")}>
            Start Reading <ArrowRight size={18} />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate("/dashboard")}>
            View Dashboard
          </Button>
        </div>
      </section>

      <section className="pb-12">
        <DailyAyahCard />
      </section>

      <div
        className="w-24 h-px mx-auto mb-12"
        style={{ backgroundColor: "var(--color-gold)" }}
      />

      <section className="pb-16">
        <h2
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
          className="text-3xl font-semibold text-center mb-8"
        >
          Everything you need to stay consistent
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="flex flex-col gap-3">
              <span className="text-3xl">{feature.icon}</span>
              <div>
                <h3
                  style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
                  className="text-xl font-semibold mb-1"
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <Card padding="large" className="text-center flex flex-col items-center gap-4">
          <span className="text-4xl">🌙</span>
          <h2
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
            className="text-2xl font-semibold"
          >
            Your Ramadan momentum doesn't have to stop.
          </h2>
          <p className="text-sm max-w-md" style={{ color: "var(--color-muted)" }}>
            Thousands of Muslims lose their Quran habit after Ramadan. QuranReconnect
            makes it simple to keep going — one ayah at a time.
          </p>
          <Button onClick={() => navigate("/reader")}>
            Begin Today <ArrowRight size={16} />
          </Button>
        </Card>
      </section>
    </div>
  )
}
