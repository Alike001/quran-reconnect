/* eslint-env node */
/* global process */
import { Buffer } from "node:buffer"
import http from "node:http"
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { URL, fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadDotEnv() {
  const envPath = path.resolve(__dirname, "..", ".env")
  if (!fs.existsSync(envPath)) return

  const raw = fs.readFileSync(envPath, "utf8")
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const idx = trimmed.indexOf("=")
    if (idx === -1) continue

    const key = trimmed.slice(0, idx).trim()
    let value = trimmed.slice(idx + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadDotEnv()

const PORT = Number(process.env.PORT || 3002)
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173"
const QF_ENV = process.env.QF_ENV || "prelive"
const QF_CLIENT_ID = process.env.QF_CLIENT_ID || ""
const QF_CLIENT_SECRET = process.env.QF_CLIENT_SECRET || ""
const QF_REDIRECT_URI =
  process.env.QF_REDIRECT_URI || `http://localhost:${PORT}/api/auth/callback`
const QF_TRANSLATION_ID = process.env.QF_TRANSLATION_ID || "20"
const QF_TAFSIR_ID = process.env.QF_TAFSIR_ID || "169"
const QF_RECITATION_ID = process.env.QF_RECITATION_ID || "2"
const QF_MUSHAF_ID = Number(process.env.QF_MUSHAF_ID || 1)

const AUTH_BASE =
  process.env.QF_AUTH_BASE_URL ||
  (QF_ENV === "production"
    ? "https://oauth2.quran.foundation"
    : "https://prelive-oauth2.quran.foundation")

const CONTENT_API_BASE = "https://api.quran.com"

const USER_API_BASE =
  process.env.QF_USER_API_BASE ||
  (QF_ENV === "production"
    ? "https://apis.quran.foundation"
    : "https://apis-prelive.quran.foundation")

const SESSION_COOKIE = "qf_session"
const sessions = new Map()

const contentTokenCache = {
  token: null,
  expiresAt: 0,
  inflight: null,
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data)
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": FRONTEND_BASE_URL,
    "Access-Control-Allow-Credentials": "true",
  })
  res.end(body)
}

function redirect(res, location) {
  res.writeHead(302, {
    Location: location,
    "Access-Control-Allow-Origin": FRONTEND_BASE_URL,
    "Access-Control-Allow-Credentials": "true",
  })
  res.end()
}

function parseCookies(req) {
  const cookies = {}
  const raw = req.headers.cookie || ""

  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=")
    if (!name) continue
    cookies[name] = decodeURIComponent(rest.join("="))
  }

  return cookies
}

function getSession(req, res) {
  const cookies = parseCookies(req)
  let sessionId = cookies[SESSION_COOKIE]

  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = crypto.randomUUID()
    sessions.set(sessionId, {})

    const cookieParts = [
      `${SESSION_COOKIE}=${sessionId}`,
      "HttpOnly",
      "Path=/",
      "SameSite=None",
      "Secure",
    ]

    res.setHeader("Set-Cookie", cookieParts.join("; "))
  }

  return { sessionId, session: sessions.get(sessionId) }
}

function clearSession(sessionId, res) {
  if (sessionId) sessions.delete(sessionId)

  const cookieParts = [
    `${SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "Max-Age=0",
    "SameSite=None",
    "Secure",
  ]

  res.setHeader("Set-Cookie", cookieParts.join("; "))
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString("utf8")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function sha256Base64Url(value) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function decodeJwtClaims(jwt) {
  try {
    const [, payload] = jwt.split(".")
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  } catch {
    return null
  }
}

function stripHtml(text = "") {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function normalizeAudioUrl(url = "") {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("//")) return `https:${url}`
  return `https://audio.qurancdn.com/${url.replace(/^\/+/, "")}`
}

async function getContentToken(forceRefresh = false) {
  if (!QF_CLIENT_ID || !QF_CLIENT_SECRET) {
    throw new Error("Missing QF_CLIENT_ID or QF_CLIENT_SECRET in .env")
  }

  const now = Date.now()

  if (!forceRefresh && contentTokenCache.token && now < contentTokenCache.expiresAt - 60_000) {
    return contentTokenCache.token
  }

  if (!forceRefresh && contentTokenCache.inflight) {
    return contentTokenCache.inflight
  }

  contentTokenCache.inflight = (async () => {
    const response = await fetch(`${AUTH_BASE}/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${QF_CLIENT_ID}:${QF_CLIENT_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "content",
      }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.access_token) {
      throw new Error(
        data.error_description || data.message || `Content token failed (${response.status})`
      )
    }

    contentTokenCache.token = data.access_token
    contentTokenCache.expiresAt = Date.now() + Number(data.expires_in || 3600) * 1000
    return contentTokenCache.token
  })()

  try {
    return await contentTokenCache.inflight
  } finally {
    contentTokenCache.inflight = null
  }
}

async function contentFetch(pathname, retry401 = true) {
  const token = await getContentToken(false)

  const response = await fetch(`${CONTENT_API_BASE}/api/v4${pathname}`, {
    headers: {
      "x-auth-token": token,
      "x-client-id": QF_CLIENT_ID,
      Accept: "application/json",
    },
  })

  if (response.status === 401 && retry401) {
    await getContentToken(true)
    return contentFetch(pathname, false)
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || data.error_description || `Content API error (${response.status})`)
  }

  return data
}

async function refreshUserTokenIfNeeded(session) {
  if (!session?.tokens?.refresh_token) return false
  if (Date.now() < (session.tokens.expiresAt || 0) - 60_000) return true

  const response = await fetch(`${AUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${QF_CLIENT_ID}:${QF_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: session.tokens.refresh_token,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.access_token) return false

  session.tokens = {
    ...session.tokens,
    access_token: data.access_token,
    refresh_token: data.refresh_token || session.tokens.refresh_token,
    id_token: data.id_token || session.tokens.id_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
  }

  return true
}

async function ensureUserToken(session) {
  if (!session?.tokens?.access_token) {
    const err = new Error("Not authenticated")
    err.statusCode = 401
    throw err
  }

  if (Date.now() >= (session.tokens.expiresAt || 0) - 60_000) {
    const ok = await refreshUserTokenIfNeeded(session)
    if (!ok) {
      const err = new Error("Session expired. Please sign in again.")
      err.statusCode = 401
      throw err
    }
  }

  return session.tokens.access_token
}

async function userFetch(session, pathname, { method = "GET", body, retry401 = true } = {}) {
  const accessToken = await ensureUserToken(session)

  const response = await fetch(`${USER_API_BASE}/auth/v1${pathname}`, {
    method,
    headers: {
      "x-auth-token": accessToken,
      "x-client-id": QF_CLIENT_ID,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (response.status === 401 && retry401) {
    const ok = await refreshUserTokenIfNeeded(session)
    if (ok) return userFetch(session, pathname, { method, body, retry401: false })
  }

  if (!response.ok) {
    const err = new Error(data.message || `User API error (${response.status})`)
    err.statusCode = response.status
    throw err
  }

  return data
}

async function fetchVerseDetails(surah, ayah) {
  const verseKey = `${surah}:${ayah}`

  const params = new URLSearchParams({
    translations: QF_TRANSLATION_ID,
    tafsirs: QF_TAFSIR_ID,
    audio: QF_RECITATION_ID,
    fields: "text_uthmani,chapter_id,verse_key,verse_number,juz_number",
    translation_fields: "resource_name,language_name,text",
    tafsir_fields: "resource_name,language_name,text",
  })

  const data = await contentFetch(`/verses/by_key/${verseKey}?${params.toString()}`)
  const verse = data.verse
  if (!verse) throw new Error("Verse not found")

  const derivedSurah =
    Number(verse.chapter_id) ||
    Number(String(verse.verse_key || verseKey).split(":")[0]) ||
    Number(surah)

  const derivedAyah =
    Number(verse.verse_number) ||
    Number(String(verse.verse_key || verseKey).split(":")[1]) ||
    Number(ayah)

  let surahName = `Surah ${derivedSurah}`

  try {
    const chapterData = await contentFetch("/chapters")
    const chapter = (chapterData.chapters || []).find((ch) => Number(ch.id) === derivedSurah)
    if (chapter) {
      surahName = chapter.name_simple || chapter.name_arabic || surahName
    }
  } catch (error) {
    console.warn("Could not resolve chapter name from chapters endpoint.", error)
  }

  const translationText = stripHtml(
    verse.translations?.[0]?.text ||
      verse.translation?.text ||
      ""
  )

  const tafsirText = stripHtml(
    verse.tafsirs?.[0]?.text ||
      verse.tafsir?.text ||
      ""
  )

  return {
    id: verse.verse_key || `${derivedSurah}:${derivedAyah}`,
    surah: derivedSurah,
    ayah: derivedAyah,
    surahName,
    arabic: verse.text_uthmani || "",
    translation: translationText,
    audioUrl: normalizeAudioUrl(verse.audio?.url || ""),
    juz: verse.juz_number || null,
    revelationType: "",
    tafsir: {
      text: tafsirText,
      source: verse.tafsirs?.[0]?.resource_name || "Tafsir",
    },
  }
}

async function handleContentChapters(res) {
  const data = await contentFetch("/chapters")
  const chapters = (data.chapters || []).map((ch) => ({
    id: ch.id,
    name: ch.name_simple,
    arabicName: ch.name_arabic,
    ayahCount: ch.verses_count,
    revelationType: ch.revelation_place,
  }))
  sendJson(res, 200, { success: true, chapters })
}

async function handleContentAyah(res, surah, ayah) {
  const verse = await fetchVerseDetails(surah, ayah)
  sendJson(res, 200, { success: true, verse })
}

async function handleAuthLogin(session, res) {
  const codeVerifier = base64Url(crypto.randomBytes(32))
  const codeChallenge = sha256Base64Url(codeVerifier)
  const state = base64Url(crypto.randomBytes(24))
  const nonce = base64Url(crypto.randomBytes(24))

  session.auth = { codeVerifier, state, nonce }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: QF_CLIENT_ID,
    redirect_uri: QF_REDIRECT_URI,
    scope: "openid offline_access user collection",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  redirect(res, `${AUTH_BASE}/oauth2/auth?${params.toString()}`)
}

async function handleAuthCallback(urlObj, session, res) {
  const code = urlObj.searchParams.get("code")
  const state = urlObj.searchParams.get("state")
  const error = urlObj.searchParams.get("error")

  if (error) {
    return redirect(res, `${FRONTEND_BASE_URL}/dashboard?authError=${encodeURIComponent(error)}`)
  }

  if (!code || !state || !session.auth || state !== session.auth.state) {
    return redirect(
      res,
      `${FRONTEND_BASE_URL}/dashboard?authError=${encodeURIComponent("invalid_callback")}`
    )
  }

  const response = await fetch(`${AUTH_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${QF_CLIENT_ID}:${QF_CLIENT_SECRET}`
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: QF_CLIENT_ID,
      code,
      redirect_uri: QF_REDIRECT_URI,
      code_verifier: session.auth.codeVerifier,
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.access_token) {
    return redirect(
      res,
      `${FRONTEND_BASE_URL}/dashboard?authError=${encodeURIComponent(
        data.error_description || "token_exchange_failed"
      )}`
    )
  }

  const claims = decodeJwtClaims(data.id_token || "") || {}

  session.tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    id_token: data.id_token,
    expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000,
  }

  const displayName =
    [claims.first_name, claims.last_name].filter(Boolean).join(" ").trim() ||
    claims.name ||
    claims.preferred_username ||
    claims.email ||
    "Signed in user"

  session.user = {
    sub: claims.sub || null,
    name: displayName,
    email: claims.email || "",
    firstName: claims.first_name || "",
    lastName: claims.last_name || "",
  }

  delete session.auth

  redirect(res, `${FRONTEND_BASE_URL}/dashboard?authSuccess=1`)
}

function handleAuthStatus(session, res) {
  sendJson(res, 200, {
    success: true,
    loggedIn: !!session?.tokens?.access_token,
    user: session?.user || null,
  })
}

function handleAuthLogout(sessionId, res) {
  clearSession(sessionId, res)
  sendJson(res, 200, { success: true })
}

async function handleGetBookmarks(session, res) {
  if (!session?.tokens?.access_token) {
    return sendJson(res, 200, { success: true, bookmarks: [] })
  }

  const data = await userFetch(session, `/bookmarks?type=ayah&mushafId=${QF_MUSHAF_ID}&first=20`)
  const raw = data.data || []

  const bookmarks = await Promise.all(
    raw.map(async (item) => {
      const details = await fetchVerseDetails(item.key, item.verseNumber)
      return {
        id: item.id,
        surah: item.key,
        ayah: item.verseNumber,
        surahName: details.surahName,
        arabic: details.arabic,
        translation: details.translation,
        savedAt: item.createdAt,
      }
    })
  )

  sendJson(res, 200, { success: true, bookmarks })
}

async function handleCreateBookmark(session, req, res) {
  const payload = await readBody(req)
  const surah = Number(payload?.surah)
  const ayah = Number(payload?.ayah)

  if (!surah || !ayah) {
    return sendJson(res, 400, { success: false, error: "surah and ayah are required." })
  }

  const data = await userFetch(session, "/collections/__default__/bookmarks", {
    method: "POST",
    body: {
      key: surah,
      verseNumber: ayah,
      mushaf: QF_MUSHAF_ID,
      type: "ayah",
    },
  })

  sendJson(res, 200, {
    success: true,
    bookmark: data.data || {
      id: `${surah}:${ayah}`,
      key: surah,
      verseNumber: ayah,
    },
  })
}

async function handleDeleteBookmark(session, bookmarkId, res) {
  await userFetch(session, `/bookmarks/${bookmarkId}`, { method: "DELETE" })
  sendJson(res, 200, { success: true })
}

async function handleReadingSession(session, req, res) {
  const payload = await readBody(req)
  const surah = Number(payload?.surah)
  const ayah = Number(payload?.ayah)

  if (!surah || !ayah) {
    return sendJson(res, 400, { success: false, error: "surah and ayah are required." })
  }

  const data = await userFetch(session, "/reading-sessions", {
    method: "POST",
    body: {
      chapterNumber: surah,
      verseNumber: ayah,
    },
  })

  sendJson(res, 200, { success: true, data: data.data || {} })
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`)
  const { sessionId, session } = getSession(req, res)

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": FRONTEND_BASE_URL,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    })
    return res.end()
  }

  try {
    if (req.method === "GET" && urlObj.pathname === "/api/health") {
      return sendJson(res, 200, { success: true })
    }

    if (req.method === "GET" && urlObj.pathname === "/api/content/chapters") {
      await handleContentChapters(res)
      return
    }

    const ayahMatch = urlObj.pathname.match(/^\/api\/content\/ayah\/(\d+)\/(\d+)$/)
    if (req.method === "GET" && ayahMatch) {
      await handleContentAyah(res, Number(ayahMatch[1]), Number(ayahMatch[2]))
      return
    }

    if (req.method === "GET" && urlObj.pathname === "/api/auth/login") {
      await handleAuthLogin(session, res)
      return
    }

    if (req.method === "GET" && urlObj.pathname === "/api/auth/callback") {
      await handleAuthCallback(urlObj, session, res)
      return
    }

    if (req.method === "GET" && urlObj.pathname === "/api/auth/status") {
      handleAuthStatus(session, res)
      return
    }

    if (req.method === "POST" && urlObj.pathname === "/api/auth/logout") {
      handleAuthLogout(sessionId, res)
      return
    }

    if (req.method === "GET" && urlObj.pathname === "/api/user/bookmarks") {
      await handleGetBookmarks(session, res)
      return
    }

    if (req.method === "POST" && urlObj.pathname === "/api/user/bookmarks") {
      await handleCreateBookmark(session, req, res)
      return
    }

    const bookmarkMatch = urlObj.pathname.match(/^\/api\/user\/bookmarks\/([^/]+)$/)
    if (req.method === "DELETE" && bookmarkMatch) {
      await handleDeleteBookmark(session, bookmarkMatch[1], res)
      return
    }

    if (req.method === "POST" && urlObj.pathname === "/api/user/reading-session") {
      await handleReadingSession(session, req, res)
      return
    }

    return sendJson(res, 404, { success: false, error: "Not found" })
  } catch (error) {
    return sendJson(res, error.statusCode || 500, {
      success: false,
      error: error.message || "Unexpected server error",
    })
  }
})

server.listen(PORT, "0.0.0.0", () => {
  console.log(`QuranReconnect API server listening on port ${PORT}`)
})