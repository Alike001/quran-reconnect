import { useEffect, useState } from "react"
import { addBookmark, getBookmarks, removeBookmark } from "../services/userApi"

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await getBookmarks()
        if (active) setBookmarks(data)
      } finally {
        if (active) setLoaded(true)
      }
    }

    load()

    function handleUpdate(event) {
      if (event?.detail && active) {
        setBookmarks(event.detail)
      } else {
        load()
      }
    }

    window.addEventListener("qr-bookmarks-updated", handleUpdate)

    return () => {
      active = false
      window.removeEventListener("qr-bookmarks-updated", handleUpdate)
    }
  }, [])

  function isBookmarked(surah, ayah) {
    return bookmarks.some(
      (bookmark) =>
        Number(bookmark.surah) === Number(surah) &&
        Number(bookmark.ayah) === Number(ayah)
    )
  }

  async function toggleBookmark(ayahData) {
    const existing = bookmarks.find(
      (bookmark) =>
        Number(bookmark.surah) === Number(ayahData.surah) &&
        Number(bookmark.ayah) === Number(ayahData.ayah)
    )

    if (existing) {
      await removeBookmark(existing)
      return
    }

    await addBookmark(ayahData)
  }

  return { bookmarks, loaded, isBookmarked, toggleBookmark }
}