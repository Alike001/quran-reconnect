import { useState, useEffect, useCallback } from "react"
import { recordReadingSession } from "../services/userApi"

const STORAGE_KEY = "qr_last_read"
const DEFAULT_PROGRESS = { surah: 1, ayah: 1, surahName: "Al-Fatihah" }

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_PROGRESS
    } catch {
      return DEFAULT_PROGRESS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      console.warn("Could not save reading progress")
    }
  }, [progress])

  const markRead = useCallback((surah, ayah, surahName) => {
    setProgress((current) => {
      if (
        current.surah === surah &&
        current.ayah === ayah &&
        current.surahName === surahName
      ) {
        return current
      }

      return { surah, ayah, surahName }
    })

    recordReadingSession(surah, ayah).catch(() => {})
  }, [])

  const nextAyah = useCallback((maxAyah, nextSurah, nextSurahName) => {
    setProgress((current) => {
      if (current.ayah < maxAyah) {
        return { ...current, ayah: current.ayah + 1 }
      }

      if (nextSurah) {
        return { surah: nextSurah, ayah: 1, surahName: nextSurahName }
      }

      return current
    })
  }, [])

  const prevAyah = useCallback((prevSurah, prevSurahMaxAyah, prevSurahName) => {
    setProgress((current) => {
      if (current.ayah > 1) {
        return { ...current, ayah: current.ayah - 1 }
      }

      if (prevSurah) {
        return { surah: prevSurah, ayah: prevSurahMaxAyah, surahName: prevSurahName }
      }

      return current
    })
  }, [])

  return { progress, markRead, nextAyah, prevAyah }
}