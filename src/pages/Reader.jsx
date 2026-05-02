import { useState, useEffect, useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { getSurah, getChapters } from "../services/contentApi"
import { useProgress } from "../hooks/useProgress"

import SurahReader from "../components/quran/SurahReader"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

const NO_BISMILLAH_SURAHS = new Set([1, 9])

export default function Reader() {
  const { progress, markRead } = useProgress()
  const [searchParams, setSearchParams] = useSearchParams()

  const [chapter, setChapter] = useState(null)
  const [verses, setVerses] = useState([])
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const initialAyah = useMemo(() => {
    const param = Number(searchParams.get("ayah"))
    if (param > 0) return param
    return progress.ayah || 1
  }, [searchParams, progress.ayah])

  const surahId = useMemo(() => {
    const param = Number(searchParams.get("surah"))
    if (param >= 1 && param <= 114) return param
    return progress.surah || 1
  }, [searchParams, progress.surah])

  useEffect(() => {
    getChapters().then(setChapters).catch(() => {})
  }, [])

  const loadSurah = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSurah(surahId)
      setChapter(data.chapter)
      setVerses(data.verses)
    } catch {
      setError("Could not load this surah. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [surahId])

  useEffect(() => {
    loadSurah()
  }, [loadSurah])

  function navigateToSurah(newSurahId) {
    if (!newSurahId || newSurahId < 1 || newSurahId > 114) return
    const next = new URLSearchParams(searchParams)
    next.set("surah", String(newSurahId))
    next.delete("ayah")
    setSearchParams(next, { replace: true })
    const ch = chapters.find((c) => c.id === newSurahId)
    markRead(newSurahId, 1, ch?.name ?? "")
  }

  function handleVersePlay(verse) {
    markRead(verse.surah, verse.ayah, verse.surahName)
  }

  const showBismillah = chapter && !NO_BISMILLAH_SURAHS.has(Number(chapter.id))

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-5">
      <div className="text-center flex flex-col items-center gap-2 pt-4">
        <p
          className="arabic-text mb-1"
          style={{ color: "var(--color-teal)", fontSize: "1.5rem" }}
        >
          ٱقْرَأْ
        </p>
        <h1
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
          className="text-3xl sm:text-4xl font-bold"
        >
          {chapter?.name || "Reader"}
        </h1>
        {chapter && (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {chapter.arabicName ? (
              <span className="arabic-text" style={{ fontSize: "1.1rem", marginRight: 8 }}>
                {chapter.arabicName}
              </span>
            ) : null}
            · {chapter.ayahCount} verses
            {chapter.revelationType ? ` · ${chapter.revelationType}` : ""}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigateToSurah(surahId - 1)}
          disabled={surahId <= 1}
          aria-label="Previous surah"
        >
          <ChevronLeft size={14} /> Prev
        </Button>

        <select
          value={surahId}
          onChange={(e) => navigateToSurah(Number(e.target.value))}
          className="flex-1 px-3 py-2 rounded-xl text-sm border"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-body)",
          }}
          aria-label="Select surah"
        >
          {chapters.length === 0 && (
            <option value={surahId}>Surah {surahId}</option>
          )}
          {chapters.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.id}. {ch.name} — {ch.arabicName}
            </option>
          ))}
        </select>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigateToSurah(surahId + 1)}
          disabled={surahId >= 114}
          aria-label="Next surah"
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>

      {showBismillah && (
        <p
          className="arabic-text text-center"
          style={{ color: "var(--color-teal)", fontSize: "1.5rem" }}
          translate="no"
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>
      )}

      {loading && <LoadingSpinner message="Loading surah..." />}

      {error && !loading && (
        <Card padding="normal" className="text-center flex flex-col items-center gap-3">
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            {error}
          </p>
          <Button variant="secondary" size="sm" onClick={loadSurah}>
            <RefreshCw size={14} /> Try Again
          </Button>
        </Card>
      )}

      {!loading && !error && verses.length > 0 && (
        <SurahReader
          key={surahId}
          verses={verses}
          initialAyah={initialAyah}
          onVersePlay={handleVersePlay}
        />
      )}
    </div>
  )
}
