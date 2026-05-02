import { useEffect, useMemo, useRef, useState } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Loader,
} from "lucide-react"

import BookmarkButton from "./BookmarkButton"
import { useBookmarks } from "../../hooks/useBookmarks"

function formatTime(secs) {
  if (!secs || Number.isNaN(secs)) return "0:00"
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

function VerseRow({ verse, isPlaying, onTogglePlay, isBookmarked, onToggleBookmark, registerRef }) {
  const ref = useRef(null)

  useEffect(() => {
    registerRef(verse.ayah, ref.current)
    return () => registerRef(verse.ayah, null)
  }, [verse.ayah, registerRef])

  return (
    <div
      ref={ref}
      className="rounded-2xl px-4 py-5 sm:px-6 sm:py-6 flex flex-col gap-4 transition-all"
      style={{
        backgroundColor: isPlaying ? "rgba(45,125,111,0.06)" : "var(--color-surface)",
        borderLeft: `3px solid ${isPlaying ? "var(--color-teal)" : "transparent"}`,
        border: isPlaying ? `1px solid rgba(45,125,111,0.25)` : `1px solid var(--color-border)`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-1 rounded-lg"
            style={{
              backgroundColor: isPlaying ? "rgba(45,125,111,0.15)" : "rgba(201,168,76,0.12)",
              color: isPlaying ? "var(--color-teal)" : "var(--color-gold-dark)",
              fontFamily: "var(--font-body)",
            }}
          >
            {verse.surah}:{verse.ayah}
          </span>
          {verse.juz && (
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              Juz {verse.juz}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              backgroundColor: isPlaying ? "var(--color-teal)" : "rgba(45,125,111,0.10)",
              color: isPlaying ? "white" : "var(--color-teal)",
            }}
            aria-label={isPlaying ? "Pause this verse" : "Play this verse"}
          >
            {isPlaying ? <Pause size={15} fill="white" /> : <Play size={15} fill="currentColor" />}
          </button>

          <BookmarkButton isBookmarked={isBookmarked} onToggle={onToggleBookmark} />
        </div>
      </div>

      <p
        className="arabic-text text-right leading-loose"
        style={{ color: "var(--color-ink)", fontSize: "1.7rem" }}
        translate="no"
      >
        {verse.arabic}
      </p>

      {verse.translation && (
        <p
          className="text-base leading-relaxed"
          style={{
            color: "var(--color-ink-light)",
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
          }}
        >
          “{verse.translation}”
        </p>
      )}

    </div>
  )
}

export default function SurahReader({ verses, initialAyah = 1, onVersePlay }) {
  const { isBookmarked, toggleBookmark } = useBookmarks()

  const [playingIndex, setPlayingIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [audioLoading, setAudioLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioError, setAudioError] = useState(null)

  const audioRef = useRef(null)
  const verseRefs = useRef(new Map())
  const initialScrolledRef = useRef(false)
  const onVersePlayRef = useRef(onVersePlay)

  useEffect(() => {
    onVersePlayRef.current = onVersePlay
  }, [onVersePlay])

  const playingVerse = playingIndex != null ? verses[playingIndex] : null

  const registerRef = useMemo(
    () => (ayah, node) => {
      if (node) verseRefs.current.set(ayah, node)
      else verseRefs.current.delete(ayah)
    },
    []
  )

  useEffect(() => {
    if (initialScrolledRef.current) return
    if (!verses || verses.length === 0) return

    const node = verseRefs.current.get(initialAyah)
    if (node) {
      node.scrollIntoView({ behavior: "auto", block: "center" })
      initialScrolledRef.current = true
    }
  }, [verses, initialAyah])

  function playAtIndex(index, { scrollSmooth = true } = {}) {
    const verse = verses[index]
    if (!verse) return

    setPlayingIndex(index)
    setProgress(0)
    setCurrentTime(0)
    setAudioError(null)

    const node = verseRefs.current.get(verse.ayah)
    if (node) node.scrollIntoView({ behavior: scrollSmooth ? "smooth" : "auto", block: "center" })

    if (onVersePlayRef.current) onVersePlayRef.current(verse)

    const audio = audioRef.current
    if (!audio) return

    if (!verse.audioUrl) {
      setIsPlaying(false)
      setAudioError("Audio is not available for this verse.")
      return
    }

    audio.src = verse.audioUrl
    setAudioLoading(true)
    audio
      .play()
      .then(() => {
        setIsPlaying(true)
        setAudioLoading(false)
      })
      .catch(() => {
        setIsPlaying(false)
        setAudioLoading(false)
        setAudioError("Could not start audio. Tap play to retry.")
      })
  }

  function togglePlayAt(index) {
    if (index === playingIndex) {
      const audio = audioRef.current
      if (!audio) return
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setAudioError("Could not resume audio."))
      }
      return
    }
    playAtIndex(index)
  }

  function handleEnded() {
    setProgress(0)
    setCurrentTime(0)

    if (autoAdvance && playingIndex != null && playingIndex < verses.length - 1) {
      playAtIndex(playingIndex + 1)
    } else {
      setIsPlaying(false)
    }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
    setProgress((audio.currentTime / audio.duration) * 100 || 0)
  }

  function handleLoadedMetadata() {
    setDuration(audioRef.current?.duration || 0)
  }

  function handleSeek(e) {
    const audio = audioRef.current
    if (!audio || !duration) return
    audio.currentTime = (e.target.value / 100) * duration
    setProgress(e.target.value)
  }

  function jumpRelative(delta) {
    if (playingIndex == null) {
      playAtIndex(0)
      return
    }
    const next = playingIndex + delta
    if (next < 0 || next >= verses.length) return
    playAtIndex(next)
  }

  function handleMainPlayClick() {
    if (playingIndex == null) {
      playAtIndex(0)
      return
    }
    togglePlayAt(playingIndex)
  }

  return (
    <div className="flex flex-col gap-4 pb-32">
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={() => {
          setIsPlaying(false)
          setAudioLoading(false)
          setAudioError("Audio failed to load.")
        }}
        preload="metadata"
      />

      {verses.map((verse, index) => (
        <VerseRow
          key={`${verse.surah}:${verse.ayah}`}
          verse={verse}
          isPlaying={index === playingIndex && isPlaying}
          onTogglePlay={() => togglePlayAt(index)}
          isBookmarked={isBookmarked(verse.surah, verse.ayah)}
          onToggleBookmark={() => toggleBookmark(verse)}
          registerRef={registerRef}
        />
      ))}

      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3"
        style={{
          background:
            "linear-gradient(to top, var(--color-bg) 70%, rgba(249,246,239,0))",
        }}
      >
        <div
          className="max-w-2xl mx-auto rounded-2xl flex flex-col gap-2 px-4 py-3"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 6px 24px rgba(28,28,46,0.10)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => jumpRelative(-1)}
              disabled={playingIndex == null || playingIndex === 0}
              className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
              style={{ color: "var(--color-ink)" }}
              aria-label="Previous verse"
            >
              <SkipBack size={16} fill="currentColor" />
            </button>

            <button
              onClick={handleMainPlayClick}
              disabled={audioLoading}
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
              style={{ backgroundColor: "var(--color-teal)", color: "white" }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {audioLoading ? (
                <Loader size={20} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={20} fill="white" />
              ) : (
                <Play size={20} fill="white" />
              )}
            </button>

            <button
              onClick={() => jumpRelative(1)}
              disabled={playingIndex == null || playingIndex >= verses.length - 1}
              className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 transition-all active:scale-95"
              style={{ color: "var(--color-ink)" }}
              aria-label="Next verse"
            >
              <SkipForward size={16} fill="currentColor" />
            </button>

            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Volume2 size={12} style={{ color: "var(--color-muted)", flexShrink: 0 }} />
                  <span
                    className="text-xs truncate"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {playingVerse
                      ? `${playingVerse.surahName} ${playingVerse.surah}:${playingVerse.ayah}`
                      : "Press play to start reciting"}
                  </span>
                </div>

                <label
                  className="flex items-center gap-1 text-xs cursor-pointer flex-shrink-0"
                  style={{ color: "var(--color-muted)" }}
                  title="Auto-advance to next verse when current one ends"
                >
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="cursor-pointer"
                    style={{ accentColor: "var(--color-teal)" }}
                  />
                  Auto
                </label>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--color-teal) ${progress}%, var(--color-border) ${progress}%)`,
                  outline: "none",
                }}
                aria-label="Audio seek"
              />

              <div
                className="flex justify-between text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {audioError && (
            <p className="text-xs text-center" style={{ color: "#C0392B" }}>
              {audioError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
