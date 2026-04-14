import { useState, useEffect } from "react"

const STORAGE_KEY = "qr_bookmarks"

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
    } catch {
      console.warn("Could not save bookmarks")
    }
  }, [bookmarks])

  function isBookmarked(surah, ayah) {
    return bookmarks.some((b) => b.surah === surah && b.ayah === ayah)
  }

  function toggleBookmark(ayahData) {
    const { surah, ayah } = ayahData
    if (isBookmarked(surah, ayah)) {
      setBookmarks((prev) => prev.filter((b) => !(b.surah === surah && b.ayah === ayah)))
    } else {
      setBookmarks((prev) => [
        { ...ayahData, savedAt: new Date().toISOString() },
        ...prev,
      ])
    }
  }

  function clearAll() {
    setBookmarks([])
  }

  return { bookmarks, isBookmarked, toggleBookmark, clearAll }
}