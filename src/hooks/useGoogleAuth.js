import { useState, useCallback, useEffect } from 'react'

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'

export function useGoogleAuth() {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [tokenClient, setTokenClient] = useState(null)
  const [gisReady, setGisReady] = useState(false)

  useEffect(() => {
    const init = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) return
          setAccessToken(response.access_token)
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            })
            setUser(await res.json())
          } catch (_) {}
        }
      })
      setTokenClient(client)
      setGisReady(true)
    }

    if (window.google?.accounts?.oauth2) {
      init()
      return
    }
    const timer = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(timer)
        init()
      }
    }, 100)
    return () => clearInterval(timer)
  }, [])

  const signIn = useCallback(() => {
    tokenClient?.requestAccessToken({ prompt: '' })
  }, [tokenClient])

  const signOut = useCallback(() => {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {})
    }
    setAccessToken(null)
    setUser(null)
  }, [accessToken])

  return { accessToken, user, signIn, signOut, isSignedIn: !!accessToken, gisReady }
}
