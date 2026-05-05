import { useCallback } from 'react'

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID
const BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`

export function useGoogleSheets(accessToken) {
  const readRange = useCallback(async (range) => {
    const res = await fetch(`${BASE}/values/${encodeURIComponent(range)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Sheets API error: ${res.status}`)
    }
    const data = await res.json()
    return data.values || []
  }, [accessToken])

  const writeRange = useCallback(async (range, values) => {
    const res = await fetch(
      `${BASE}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      }
    )
    if (!res.ok) throw new Error(`Sheets write error: ${res.status}`)
  }, [accessToken])

  return { readRange, writeRange }
}
