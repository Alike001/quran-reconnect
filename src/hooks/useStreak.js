import { useEffect, useState } from "react"
import { getStreak } from "../services/userApi"

export function useStreak() {
  const [streak, setStreak] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await getStreak()
        if (active) setStreak(data)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    function handleUpdate(event) {
      if (event?.detail) {
        setStreak(event.detail)
      } else {
        load()
      }
    }

    window.addEventListener("qr-streak-updated", handleUpdate)
    window.addEventListener("focus", load)

    return () => {
      active = false
      window.removeEventListener("qr-streak-updated", handleUpdate)
      window.removeEventListener("focus", load)
    }
  }, [])

  return { streak, loading }
}