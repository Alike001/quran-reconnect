import { useEffect, useState } from "react"
import {
  getAuthStatus,
  loginWithQuranFoundation,
  logoutFromQuranFoundation,
} from "../services/userApi"

export function useAuth() {
  const [auth, setAuth] = useState({
    loggedIn: false,
    user: null,
    loading: true,
  })

  useEffect(() => {
    let active = true

    getAuthStatus()
      .then((data) => {
        if (!active) return
        setAuth({
          loggedIn: !!data.loggedIn,
          user: data.user || null,
          loading: false,
        })
      })
      .catch(() => {
        if (!active) return
        setAuth({
          loggedIn: false,
          user: null,
          loading: false,
        })
      })

    return () => {
      active = false
    }
  }, [])

  return {
    ...auth,
    login: loginWithQuranFoundation,
    logout: logoutFromQuranFoundation,
  }
}