export const config = {
  API_BASE: import.meta.env.VITE_APP_API_BASE || "/api",
  USE_MOCK_FALLBACK: (import.meta.env.VITE_USE_MOCK_FALLBACK || "true") === "true",
  DAILY_GOAL_AYAHS: 5,
}

export const DAILY_AYAHS = [
  { surah: 2, ayah: 255, surahName: "Al-Baqarah", note: "Ayat al-Kursi" },
  { surah: 2, ayah: 286, surahName: "Al-Baqarah", note: "Closing du'a" },
  { surah: 2, ayah: 152, surahName: "Al-Baqarah", note: "Remember Me" },
  { surah: 2, ayah: 201, surahName: "Al-Baqarah", note: "Both worlds" },
  { surah: 3, ayah: 8, surahName: "Aali Imran", note: "Steadfast hearts" },
  { surah: 3, ayah: 185, surahName: "Aali Imran", note: "Every soul" },
  { surah: 7, ayah: 55, surahName: "Al-A'raf", note: "Call on Him" },
  { surah: 10, ayah: 62, surahName: "Yunus", note: "Friends of Allah" },
  { surah: 13, ayah: 28, surahName: "Ar-Ra'd", note: "Hearts find rest" },
  { surah: 14, ayah: 7, surahName: "Ibrahim", note: "Gratitude" },
  { surah: 16, ayah: 97, surahName: "An-Nahl", note: "Good life" },
  { surah: 17, ayah: 80, surahName: "Al-Isra", note: "Prayer of entry" },
  { surah: 20, ayah: 114, surahName: "Ta-Ha", note: "Increase in knowledge" },
  { surah: 24, ayah: 35, surahName: "An-Nur", note: "Light upon light" },
  { surah: 25, ayah: 74, surahName: "Al-Furqan", note: "Du'a for family" },
  { surah: 29, ayah: 69, surahName: "Al-Ankabut", note: "Strive in Him" },
  { surah: 33, ayah: 35, surahName: "Al-Ahzab", note: "Reward for the sincere" },
  { surah: 39, ayah: 53, surahName: "Az-Zumar", note: "Do not despair" },
  { surah: 41, ayah: 30, surahName: "Fussilat", note: "Steadfast believers" },
  { surah: 49, ayah: 13, surahName: "Al-Hujurat", note: "Best is most pious" },
  { surah: 55, ayah: 13, surahName: "Ar-Rahman", note: "Which favours?" },
  { surah: 57, ayah: 20, surahName: "Al-Hadid", note: "This worldly life" },
  { surah: 65, ayah: 3, surahName: "At-Talaq", note: "He will provide" },
  { surah: 67, ayah: 1, surahName: "Al-Mulk", note: "Dominion" },
  { surah: 76, ayah: 9, surahName: "Al-Insan", note: "For His sake" },
  { surah: 89, ayah: 27, surahName: "Al-Fajr", note: "Reassured soul" },
  { surah: 93, ayah: 5, surahName: "Ad-Duha", note: "He will give" },
  { surah: 94, ayah: 5, surahName: "Ash-Sharh", note: "With hardship, ease" },
  { surah: 103, ayah: 2, surahName: "Al-Asr", note: "By time" },
  { surah: 112, ayah: 1, surahName: "Al-Ikhlas", note: "He is One" },
]

export function getDailyAyah(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date - start) / 86400000)
  const index = dayOfYear % DAILY_AYAHS.length
  return DAILY_AYAHS[index]
}
