import { config } from "../config"

const KEYS = {
  streak: "qr_streak",
  reflections: "qr_reflections",
  bookmarks: "qr_bookmarks",
}

const DEFAULT_STREAK = {
  current: 0,
  longest: 0,
  lastReadDate: null,
  totalDaysRead: 0,
}

const DEFAULT_REFLECTIONS = []
const DEFAULT_BOOKMARKS = []

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

function readLocal(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn(`Could not persist ${key}`)
  }
}

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${config.API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.error || `User API error (${res.status})`)
    error.statusCode = res.status
    throw error
  }
  return data
}

export async function getAuthStatus() {
  try {
    return await apiFetch("/auth/status")
  } catch (error) {
    console.warn("Auth status check failed.", error)
    return { success: false, loggedIn: false, user: null }
  }
}

export function loginWithQuranFoundation() {
  window.location.href = `${config.API_BASE}/auth/login`
}

export async function logoutFromQuranFoundation() {
  try {
    await apiFetch("/auth/logout", { method: "POST" })
  } finally {
    window.location.reload()
  }
}

export async function getStreak() {
  await delay(50)

  const saved = readLocal(KEYS.streak, null)

  if (!saved) {
    writeLocal(KEYS.streak, DEFAULT_STREAK)
    return DEFAULT_STREAK
  }

  const normalized = {
    current: Number(saved.current) || 0,
    longest: Number(saved.longest) || 0,
    lastReadDate: saved.lastReadDate || null,
    totalDaysRead: Number(saved.totalDaysRead) || 0,
  }

  writeLocal(KEYS.streak, normalized)
  return normalized
}

export async function recordReadingSession(surah, ayah) {
  const today = new Date().toISOString().split("T")[0]
  const current = readLocal(KEYS.streak, DEFAULT_STREAK)

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  let newCurrent = current.current || 0
  let newTotalDaysRead = current.totalDaysRead || 0

  if (current.lastReadDate === today) {
    newCurrent = current.current || 1
    newTotalDaysRead = current.totalDaysRead || 1
  } else if (current.lastReadDate === yesterdayStr) {
    newCurrent = (current.current || 0) + 1
    newTotalDaysRead = (current.totalDaysRead || 0) + 1
  } else {
    newCurrent = 1
    newTotalDaysRead = (current.totalDaysRead || 0) + 1
  }

  const updated = {
    current: newCurrent,
    longest: Math.max(newCurrent, current.longest || 0),
    lastReadDate: today,
    totalDaysRead: newTotalDaysRead,
  }

  writeLocal(KEYS.streak, updated)
  window.dispatchEvent(new CustomEvent("qr-streak-updated", { detail: updated }))

  try {
    if (surah && ayah) {
      await apiFetch("/user/reading-session", {
        method: "POST",
        body: JSON.stringify({ surah, ayah }),
      })
    }
  } catch (error) {
    console.warn("Reading session sync failed, using local progress only.", error)
  }

  return updated
}

export async function getReflections() {
  await delay(50)
  return readLocal(KEYS.reflections, DEFAULT_REFLECTIONS)
}

export async function saveReflection(reflection) {
  await delay(80)
  const existing = readLocal(KEYS.reflections, DEFAULT_REFLECTIONS)

  const next = {
    id: `r${Date.now()}`,
    ayahRef: reflection.ayahRef,
    text: reflection.text,
    createdAt: new Date().toISOString(),
  }

  const updated = [next, ...existing]
  writeLocal(KEYS.reflections, updated)
  return next
}

export async function deleteReflection(id) {
  await delay(50)
  const existing = readLocal(KEYS.reflections, DEFAULT_REFLECTIONS)
  const updated = existing.filter((item) => item.id !== id)
  writeLocal(KEYS.reflections, updated)
  return { success: true }
}

export async function getBookmarks() {
  const localBookmarks = readLocal(KEYS.bookmarks, DEFAULT_BOOKMARKS)

  try {
    const data = await apiFetch("/user/bookmarks")
    const remoteBookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : []

    if (remoteBookmarks.length > 0) {
      writeLocal(KEYS.bookmarks, remoteBookmarks)
      return remoteBookmarks
    }

    return localBookmarks
  } catch (error) {
    console.warn("Bookmark fetch sync failed, using local bookmarks.", error)
    return localBookmarks
  }
}

export async function addBookmark(ayahData) {
  const localBookmark = {
    ...ayahData,
    id: `${ayahData.surah}:${ayahData.ayah}`,
    savedAt: new Date().toISOString(),
  }

  const current = readLocal(KEYS.bookmarks, DEFAULT_BOOKMARKS)
  const updated = [
    localBookmark,
    ...current.filter(
      (item) =>
        !(
          Number(item.surah) === Number(ayahData.surah) &&
          Number(item.ayah) === Number(ayahData.ayah)
        )
    ),
  ]

  writeLocal(KEYS.bookmarks, updated)
  window.dispatchEvent(new CustomEvent("qr-bookmarks-updated", { detail: updated }))

  try {
    const data = await apiFetch("/user/bookmarks", {
      method: "POST",
      body: JSON.stringify({
        surah: ayahData.surah,
        ayah: ayahData.ayah,
      }),
    })

    const remoteId = data.bookmark?.id
    if (remoteId) {
      const synced = updated.map((item) =>
        Number(item.surah) === Number(ayahData.surah) &&
        Number(item.ayah) === Number(ayahData.ayah)
          ? { ...item, remoteId }
          : item
      )

      writeLocal(KEYS.bookmarks, synced)
      window.dispatchEvent(new CustomEvent("qr-bookmarks-updated", { detail: synced }))
      return synced.find(
        (item) =>
          Number(item.surah) === Number(ayahData.surah) &&
          Number(item.ayah) === Number(ayahData.ayah)
      )
    }
  } catch (error) {
    console.warn("Bookmark sync failed, using local bookmark only.", error)
  }

  return localBookmark
}

export async function removeBookmark(bookmark) {
  const current = readLocal(KEYS.bookmarks, DEFAULT_BOOKMARKS)
  const updated = current.filter(
    (item) =>
      !(
        Number(item.surah) === Number(bookmark.surah) &&
        Number(item.ayah) === Number(bookmark.ayah)
      )
  )

  writeLocal(KEYS.bookmarks, updated)
  window.dispatchEvent(new CustomEvent("qr-bookmarks-updated", { detail: updated }))

  try {
    const idToDelete = bookmark.remoteId || bookmark.id

    if (idToDelete && !String(idToDelete).includes(":")) {
      await apiFetch(`/user/bookmarks/${idToDelete}`, { method: "DELETE" })
    }
  } catch (error) {
    console.warn("Bookmark delete sync failed, local bookmark already removed.", error)
  }

  return { success: true }
}