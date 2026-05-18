import { useState, useCallback, useEffect, useRef } from 'react'

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'
const LS_TOKEN = 'smtm_token'
const LS_EXPIRY = 'smtm_token_expiry'
const LS_USER = 'smtm_user'
const GIS_LOAD_TIMEOUT_MS = 5000
const SILENT_LOGIN_TIMEOUT_MS = 6000

function loadCachedSession() {
  try {
    const token = localStorage.getItem(LS_TOKEN)
    const expiry = parseInt(localStorage.getItem(LS_EXPIRY) || '0', 10)
    const user = JSON.parse(localStorage.getItem(LS_USER) || 'null')
    // 만료 1분 전까지만 유효 처리
    if (token && user && Date.now() < expiry - 60_000) return { token, user }
  } catch (_) {}
  return null
}

function saveSession(token, user, expiresIn = 3600) {
  localStorage.setItem(LS_TOKEN, token)
  localStorage.setItem(LS_EXPIRY, String(Date.now() + expiresIn * 1000))
  localStorage.setItem(LS_USER, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(LS_TOKEN)
  localStorage.removeItem(LS_EXPIRY)
  localStorage.removeItem(LS_USER)
}

export function useGoogleAuth() {
  const cached = loadCachedSession()
  const [accessToken, setAccessToken] = useState(cached?.token ?? null)
  const [user, setUser] = useState(cached?.user ?? null)
  const [tokenClient, setTokenClient] = useState(null)
  const [gisReady, setGisReady] = useState(false)
  const [autoLogging, setAutoLogging] = useState(!cached)
  const silentAttempted = useRef(false)
  const silentTimeout = useRef(null)

  useEffect(() => {
    let timer
    let timeout

    const init = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (response) => {
          clearTimeout(silentTimeout.current)
          setAutoLogging(false)
          if (response.error) return
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            })
            const userInfo = await res.json()
            saveSession(response.access_token, userInfo)
            setAccessToken(response.access_token)
            setUser(userInfo)
          } catch (_) {}
        }
      })
      setTokenClient(client)
      setGisReady(true)

      if (!loadCachedSession() && !silentAttempted.current) {
        silentAttempted.current = true
        silentTimeout.current = setTimeout(() => setAutoLogging(false), SILENT_LOGIN_TIMEOUT_MS)
        client.requestAccessToken({ prompt: 'none' })
      }
    }

    if (window.google?.accounts?.oauth2) {
      init()
      return
    }

    // GIS 스크립트 로드 실패 시 무한 로딩 방지
    timeout = setTimeout(() => {
      clearInterval(timer)
      setAutoLogging(false)
    }, GIS_LOAD_TIMEOUT_MS)

    timer = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearTimeout(timeout)
        clearInterval(timer)
        init()
      }
    }, 100)

    return () => {
      clearInterval(timer)
      clearTimeout(timeout)
      clearTimeout(silentTimeout.current)
    }
  }, [])

  const signIn = useCallback(() => {
    tokenClient?.requestAccessToken({ prompt: '' })
  }, [tokenClient])

  const signOut = useCallback(() => {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {})
    }
    clearSession()
    setAccessToken(null)
    setUser(null)
  }, [accessToken])

  return { accessToken, user, signIn, signOut, isSignedIn: !!accessToken, gisReady, autoLogging }
}
