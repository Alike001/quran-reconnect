export const mockAyah = {
  id: "2:255",
  surah: 2,
  ayah: 255,
  surahName: "Al-Baqarah",
  arabic: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ",
  translation: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.",
  tafsir: "Ayat al-Kursi is considered the greatest verse of the Quran. It describes Allah's eternal existence, His perfect knowledge, and His absolute sovereignty over all creation. Ibn Kathir notes that this verse contains ten distinct sentences, each affirming a divine attribute.",
  audioUrl: "https://cdn.islamic.network/quran/audio/128/ar.alafasy/255.mp3",
  revelationType: "Medinan",
  juz: 3,
};

export const mockBookmarks = [
  { id: "1:1", surah: 1, ayah: 1, surahName: "Al-Fatihah", arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.", savedAt: new Date().toISOString() },
  { id: "2:255", surah: 2, ayah: 255, surahName: "Al-Baqarah", arabic: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ", translation: "Allah — there is no deity except Him...", savedAt: new Date().toISOString() },
];

export const mockStreak = {
  current: 7,
  longest: 14,
  lastReadDate: new Date().toISOString().split("T")[0],
  totalDaysRead: 21,
};

export const mockProgress = {
  lastRead: { surah: 2, ayah: 255, surahName: "Al-Baqarah" },
  totalAyahsRead: 42,
};

export const mockReflections = [
  {
    id: "r1",
    ayahRef: "2:255",
    text: "Reading Ayat al-Kursi reminds me that all my worries are small in front of Allah's vast knowledge.",
    createdAt: new Date().toISOString(),
  },
];

export const mockChapters = [
  { id: 1, name: "Al-Fatihah", arabicName: "الفاتحة", ayahCount: 7, revelationType: "Meccan" },
  { id: 2, name: "Al-Baqarah", arabicName: "البقرة", ayahCount: 286, revelationType: "Medinan" },
  { id: 36, name: "Ya-Sin", arabicName: "يس", ayahCount: 83, revelationType: "Meccan" },
  { id: 55, name: "Ar-Rahman", arabicName: "الرحمن", ayahCount: 78, revelationType: "Meccan" },
  { id: 67, name: "Al-Mulk", arabicName: "الملك", ayahCount: 30, revelationType: "Meccan" },
  { id: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", ayahCount: 4, revelationType: "Meccan" },
];