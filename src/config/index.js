export const config = {
  API_BASE: import.meta.env.VITE_APP_API_BASE || "/api",
  USE_MOCK_FALLBACK: (import.meta.env.VITE_USE_MOCK_FALLBACK || "true") === "true",
  DAILY_GOAL_AYAHS: 5,
}