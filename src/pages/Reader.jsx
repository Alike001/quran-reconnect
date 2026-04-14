import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

import { getAyah, getTafsir, getChapters } from "../services/contentApi"
import { useProgress } from "../hooks/useProgress"
import { useBookmarks } from "../hooks/useBookmarks"

import AyahCard from "../components/quran/AyahCard"
import AudioPlayer from "../components/quran/AudioPlayer"
import TafsirCard from "../components/quran/TafsirCard"
import BookmarkButton from "../components/quran/BookmarkButton"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

export default function Reader() {
  const { progress, markRead, nextAyah, prevAyah } = useProgress()
  const { isBookmarked, toggleBookmark } = useBookmarks()

  const [ayah, setAyah] = useState(null)
  const [tafsir, setTafsir] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getChapters()
      .then(setChapters)
      .catch(() => {})
  }, [])

  const loadAyah = useCallback(async () => {
    setLoading(true)
    setError(null)
    setTafsir(null)

    try {
      const [ayahData, tafsirData] = await Promise.all([
        getAyah(progress.surah, progress.ayah),
        getTafsir(progress.surah, progress.ayah),
      ])
      setAyah(ayahData)
      setTafsir(tafsirData)

      markRead(ayahData.surah, ayahData.ayah, ayahData.surahName)
    } catch {
      setError("Could not load this ayah. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [progress.surah, progress.ayah, markRead])

  useEffect(() => {
    loadAyah()
  }, [progress.surah, progress.ayah, loadAyah])

  function getCurrentChapter() {
    return chapters.find((c) => c.id === progress.surah)
  }

  function handleNext() {
    const chapter = getCurrentChapter()
    const maxAyah = chapter?.ayahCount ?? 286
    const nextSurahId = progress.surah < 114 ? progress.surah + 1 : null
    const nextSurahName = chapters.find((c) => c.id === nextSurahId)?.name ?? ""
    nextAyah(maxAyah, nextSurahId, nextSurahName)
  }

  function handlePrev() {
    const prevSurahId = progress.surah > 1 ? progress.surah - 1 : null
    const prevChapter = chapters.find((c) => c.id === prevSurahId)
    prevAyah(prevSurahId, prevChapter?.ayahCount ?? 1, prevChapter?.name ?? "")
  }

  const currentChapter = getCurrentChapter()
  const isLastAyah = currentChapter && progress.ayah >= currentChapter.ayahCount && progress.surah === 114
  const isFirstAyah = progress.surah === 1 && progress.ayah === 1

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 flex flex-col gap-6">

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
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Continuing from {progress.surahName} · Ayah {progress.ayah}
            </p>
        </div>

        {loading && <LoadingSpinner message="Loading verse..." />}

        {error && !loading && (
          <Card padding="normal" className="text-center flex flex-col items-center gap-3">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>{error}</p>
            <Button variant="secondary" size="sm" onClick={loadAyah}>
              <RefreshCw size={14} /> Try Again
            </Button>
          </Card>
        )}

        {!loading && !error && ayah && (
          <>
            <AyahCard
              ayah={ayah}
              rightAction={
                <BookmarkButton
                  isBookmarked={isBookmarked(ayah.surah, ayah.ayah)}
                  onToggle={() => toggleBookmark(ayah)}
                />
              }
            />

            <AudioPlayer
              audioUrl={ayah.audioUrl}
              ayahRef={`${ayah.surahName} ${ayah.surah}:${ayah.ayah}`}
            />

            <TafsirCard tafsir={tafsir} />

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={handlePrev}
                disabled={isFirstAyah}
              >
                <ChevronLeft size={16} /> Previous
              </Button>

              <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                {progress.surah}:{progress.ayah}
                {currentChapter && (
                  <span className="text-xs ml-1">/ {currentChapter.ayahCount}</span>
                )}
              </span>

              <Button
                variant="primary"
                onClick={handleNext}
                disabled={isLastAyah}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </>
        )}

        {chapters.length > 0 && (
          <Card padding="normal" className="flex flex-col gap-3">
            <p
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
              className="font-semibold text-lg"
            >
              Jump to a Surah
            </p>
            <select
              onChange={(e) => {
                const val = e.target.value
                if (!val) return
                const [s, a] = val.split(":").map(Number)
                const ch = chapters.find((c) => c.id === s)
                markRead(s, a, ch?.name ?? "")
              }}
              className="w-full px-4 py-2 rounded-xl text-sm border"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-ink)",
                fontFamily: "var(--font-body)",
              }}
              defaultValue=""
            >
              <option value="" disabled>Select a Surah...</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={`${ch.id}:1`}>
                  {ch.id}. {ch.name} — {ch.arabicName}
                </option>
              ))}
            </select>
          </Card>
        )}

    </div>
  )
}