import { useState, useEffect } from "react"
import { getStreak, recordReadingSession } from "../services/userApi"

export function useStreak() {
  const [streak, setStreak] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStreak()
      .then(setStreak)
      .catch(() => setStreak({ current: 0, longest: 0, totalDaysRead: 0 }))
      .finally(() => setLoading(false))
  }, [])

  // Call this when the user reads an ayah today
  async function recordToday() {
    try {
      const updated = await recordReadingSession()
      setStreak(updated)
    } catch {
      // Fail silently — streak recording is non-critical
    }
  }

  return { streak, loading, recordToday }
}