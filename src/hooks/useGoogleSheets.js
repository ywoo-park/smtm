import { useCallback } from 'react'

const SPREADSHEET_ID = '1LxrvSF7KOpI9JXAwOXQI2XxxsM83TGkpnyE9nF721AI'
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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    )
    if (!res.ok) throw new Error(`Sheets write error: ${res.status}`)
  }, [accessToken])

  const appendRange = useCallback(async (range, values) => {
    const res = await fetch(
      `${BASE}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    )
    if (!res.ok) throw new Error(`Sheets append error: ${res.status}`)
    return res.json()
  }, [accessToken])

  const batchUpdate = useCallback(async (requests) => {
    const res = await fetch(`${BASE}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    })
    if (!res.ok) throw new Error(`Sheets batchUpdate error: ${res.status}`)
    return res.json()
  }, [accessToken])

  const getSheets = useCallback(async () => {
    const res = await fetch(`${BASE}?fields=sheets.properties`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error(`Sheets meta error: ${res.status}`)
    const data = await res.json()
    return data.sheets || []
  }, [accessToken])

  return { readRange, writeRange, appendRange, batchUpdate, getSheets }
}
