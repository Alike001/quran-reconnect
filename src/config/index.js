export const config = {
  USE_MOCK_DATA: true,

  CONTENT_API_BASE: import.meta.env.VITE_CONTENT_API_BASE || "https://api.quranfoundation.org/content/v1",
  USER_API_BASE: import.meta.env.VITE_USER_API_BASE    || "https://api.quranfoundation.org/user/v1",

  API_KEY: import.meta.env.VITE_API_KEY || "",

  DEFAULT_TRANSLATION: "en.asad",    
  DEFAULT_TAFSIR: "en.maududi", 
  DAILY_GOAL_AYAHS: 5,
};