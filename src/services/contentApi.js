import { config } from "../config"
import { mockAyah, mockChapters } from "./mockData"

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

function withMockAyah(surah, ayah) {
  return {
    ...mockAyah,
    id: `${surah}:${ayah}`,
    surah,
    ayah,
  }
}

async function apiFetch(endpoint) {
  const res = await fetch(`${config.API_BASE}${endpoint}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Content API error (${res.status})`)
  }
  return data
}

export async function getAyah(surah, ayah) {
  try {
    const data = await apiFetch(`/content/ayah/${surah}/${ayah}`)
    return data.verse
  } catch (error) {
    if (!config.USE_MOCK_FALLBACK) throw error
    await delay(200)
    return withMockAyah(surah, ayah)
  }
}

export async function getTafsir(surah, ayah) {
  try {
    const data = await apiFetch(`/content/ayah/${surah}/${ayah}`)
    return data.verse.tafsir || { text: "No tafsir available.", source: "Tafsir" }
  } catch (error) {
    if (!config.USE_MOCK_FALLBACK) throw error
    await delay(120)
    return {
      text: mockAyah.tafsir,
      source: "Mock Tafsir",
    }
  }
}

export async function getChapters() {
  try {
    const data = await apiFetch("/content/chapters")
    return data.chapters
  } catch (error) {
    if (!config.USE_MOCK_FALLBACK) throw error
    await delay(120)
    return mockChapters
  }
}

export async function getChapter(surahId) {
  const chapters = await getChapters()
  return chapters.find((chapter) => chapter.id === Number(surahId)) || null
}