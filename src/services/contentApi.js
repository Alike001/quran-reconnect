import { config } from "../config"
import {
  mockAyah,
  mockChapters,
} from "./mockData"

async function apiFetch(endpoint) {
  const res = await fetch(`${config.CONTENT_API_BASE}${endpoint}`, {
    headers: {
      "Authorization":`Bearer ${config.API_KEY}`,
      "Content-Type": "application/json",
    },
  })
  if (!res.ok) throw new Error(`Content API error: ${res.status}`)
  return res.json()
}

export async function getAyah(surah, ayah) {
  if (config.USE_MOCK_DATA) {
    await delay(400)
    return { ...mockAyah, surah, ayah }
  }

  const data = await apiFetch(
    `/verses/${surah}/${ayah}?translation=${config.DEFAULT_TRANSLATION}&audio=true`
  )

  return {
    id: `${surah}:${ayah}`,
    surah: data.chapter_id,
    ayah: data.verse_number,
    surahName: data.chapter_name_simple,
    arabic: data.text_uthmani,
    translation: data.translations?.[0]?.text ?? "",
    audioUrl: data.audio?.url ?? "",
    juz: data.juz_number,
  }
}

export async function getTafsir(surah, ayah) {
  if (config.USE_MOCK_DATA) {
    await delay(300)
    return {
      text: mockAyah.tafsir,
      source: "Ibn Kathir (Mock)",
    }
  }

  const data = await apiFetch(
    `/verses/${surah}/${ayah}/tafsir?tafsir=${config.DEFAULT_TAFSIR}`
  )

  return {
    text:   data.tafsir?.text ?? "No tafsir available.",
    source: data.tafsir?.source_name ?? "Tafsir",
  }
}

export async function getChapters() {
  if (config.USE_MOCK_DATA) {
    await delay(200)
    return mockChapters
  }

  const data = await apiFetch("/chapters")
  return data.chapters.map((ch) => ({
    id: ch.id,
    name: ch.name_simple,
    arabicName: ch.name_arabic,
    ayahCount: ch.verses_count,
    revelationType: ch.revelation_place,
  }))
}

export async function getChapter(surahId) {
  if (config.USE_MOCK_DATA) {
    await delay(200)
    return mockChapters.find((c) => c.id === surahId) ?? mockChapters[0]
  }
  const data = await apiFetch(`/chapters/${surahId}`)
  return {
    id: data.chapter.id,
    name: data.chapter.name_simple,
    arabicName: data.chapter.name_arabic,
    ayahCount: data.chapter.verses_count,
    revelationType: data.chapter.revelation_place,
  }
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms))