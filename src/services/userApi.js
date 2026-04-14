import { config } from "../config"
import { mockStreak, mockReflections, mockBookmarks } from "./mockData"

// Local storage keys (used in mock mode only)
const KEYS = {
  streak: "qr_streak",
  reflections: "qr_reflections",
  bookmarks: "qr_bookmarks",
}

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${config.USER_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${config.API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`User API error: ${res.status}`)
  return res.json()
}

export async function getStreak() {
  if (config.USE_MOCK_DATA) {
    await delay(300)
    try {
      const saved = localStorage.getItem(KEYS.streak)
      return saved ? JSON.parse(saved) : mockStreak
    } catch { return mockStreak }
  }

  const data = await apiFetch("/user/streak")
  return {
    current: data.current_streak,
    longest: data.longest_streak,
    lastReadDate: data.last_read_date,
    totalDaysRead: data.total_days_read,
  }
}

// Call this once per day when the user reads an ayah
export async function recordReadingSession() {
  if (config.USE_MOCK_DATA) {
    await delay(200)
    const today = new Date().toISOString().split("T")[0]
    let streak = mockStreak
    try {
      const saved = localStorage.getItem(KEYS.streak)
      if (saved) streak = JSON.parse(saved)
    } catch {
         //ignore error
    }

    // Only increment if last read was yesterday or today is first read
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    let newCurrent = streak.current
    if (streak.lastReadDate === yesterdayStr) {
      newCurrent = streak.current + 1
    } else if (streak.lastReadDate !== today) {
      newCurrent = 1
    }

    const updated = {
      ...streak,
      current: newCurrent,
      longest: Math.max(newCurrent, streak.longest),
      lastReadDate: today,
      totalDaysRead: streak.totalDaysRead + (streak.lastReadDate !== today ? 1 : 0),
    }
    localStorage.setItem(KEYS.streak, JSON.stringify(updated))
    return updated
  }

  return apiFetch("/user/streak/record", { method: "POST" })
}

export async function getReflections() {
  if (config.USE_MOCK_DATA) {
    await delay(250)
    try {
      const saved = localStorage.getItem(KEYS.reflections)
      return saved ? JSON.parse(saved) : mockReflections
    } catch { return mockReflections }
  }

  const data = await apiFetch("/user/reflections")
  return data.reflections.map((r) => ({
    id: r.id,
    ayahRef: r.verse_reference,
    text: r.content,
    createdAt: r.created_at,
  }))
}

export async function saveReflection(reflection) {
  if (config.USE_MOCK_DATA) {
    await delay(300)
    let existing = []
    try {
      const saved = localStorage.getItem(KEYS.reflections)
      existing = saved ? JSON.parse(saved) : mockReflections
    } catch {
         //ignore error
    }

    const newEntry = {
      id: `r${Date.now()}`,
      ayahRef: reflection.ayahRef,
      text: reflection.text,
      createdAt: new Date().toISOString(),
    }
    const updated = [newEntry, ...existing]
    localStorage.setItem(KEYS.reflections, JSON.stringify(updated))
    return newEntry
  }

  const data = await apiFetch("/user/reflections", {
    method: "POST",
    body: JSON.stringify({
      verse_reference: reflection.ayahRef,
      content: reflection.text,
    }),
  })
  return {
    id: data.reflection.id,
    ayahRef: data.reflection.verse_reference,
    text: data.reflection.content,
    createdAt: data.reflection.created_at,
  }
}

// Delete a reflection by id
export async function deleteReflection(id) {
  if (config.USE_MOCK_DATA) {
    await delay(200)
    try {
      const saved = localStorage.getItem(KEYS.reflections)
      const existing = saved ? JSON.parse(saved) : []
      const updated = existing.filter((r) => r.id !== id)
      localStorage.setItem(KEYS.reflections, JSON.stringify(updated))
    } catch {
        //ignore error
    }
    return { success: true }
  }
  return apiFetch(`/user/reflections/${id}`, { method: "DELETE" })
}

export async function getBookmarks() {
  if (config.USE_MOCK_DATA) {
    await delay(200)
    try {
      const saved = localStorage.getItem(KEYS.bookmarks)
      return saved ? JSON.parse(saved) : mockBookmarks
    } catch { return mockBookmarks }
  }

  const data = await apiFetch("/user/bookmarks")
  return data.bookmarks.map((b) => ({
    id: `${b.chapter_id}:${b.verse_number}`,
    surah: b.chapter_id,
    ayah: b.verse_number,
    surahName: b.chapter_name,
    arabic: b.text_uthmani,
    savedAt: b.created_at,
  }))
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms))