import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, Loader } from "lucide-react"
import Card from "../ui/Card"

export default function AudioPlayer({ audioUrl, ayahRef }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)     // 0–100
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
      setDuration(0)
      setError(null)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [audioUrl])

  function handlePlayPause() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      setIsLoading(true)
      audio.play()
        .then(() => { setIsPlaying(true); setIsLoading(false) })
        .catch(() => { setError("Could not play audio."); setIsLoading(false) })
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

  function handleEnded() {
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime(0)
  }

  function handleSeek(e) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const newTime = (e.target.value / 100) * duration
    audio.currentTime = newTime
    setProgress(e.target.value)
  }

  function formatTime(secs) {
    if (!secs || isNaN(secs)) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  if (!audioUrl) return null

  return (
    <Card padding="normal">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
          style={{ backgroundColor: "var(--color-teal)", color: "white" }}
          aria-label={isPlaying ? "Pause recitation" : "Play recitation"}
        >
          {isLoading
            ? <Loader size={18} className="animate-spin" />
            : isPlaying
              ? <Pause size={18} fill="white" />
              : <Play size={18} fill="white" />
          }
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Volume2 size={13} style={{ color: "var(--color-muted)" }} />
            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
              Recitation · {ayahRef}
            </span>
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

          <div className="flex justify-between text-xs" style={{ color: "var(--color-muted)" }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs mt-2 text-center" style={{ color: "#C0392B" }}>
          {error}
        </p>
      )}
    </Card>
  )
}