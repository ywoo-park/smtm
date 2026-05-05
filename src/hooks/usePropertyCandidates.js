import { useState, useCallback, useEffect, useRef } from 'react'
import { useGoogleSheets } from './useGoogleSheets'
import { parseAmount } from '../utils/format'

const SHEET_NAME = '후보단지'
const HEADER = [['이름', '집값', '대출금', '금리', '인테리어', '메모']]

export function usePropertyCandidates(accessToken) {
  const { readRange, writeRange, appendRange, batchUpdate, getSheets } = useGoogleSheets(accessToken)
  const [candidates, setCandidates] = useState([])
  const [sheetId, setSheetId] = useState(null)
  const [loading, setLoading] = useState(false)
  const initialized = useRef(false)

  const ensureSheet = useCallback(async () => {
    const sheets = await getSheets()
    const existing = sheets.find(s => s.properties.title === SHEET_NAME)
    if (existing) return existing.properties.sheetId

    const result = await batchUpdate([{
      addSheet: { properties: { title: SHEET_NAME } },
    }])
    const newSheetId = result.replies[0].addSheet.properties.sheetId
    await writeRange(`${SHEET_NAME}!A1:F1`, HEADER)
    return newSheetId
  }, [getSheets, batchUpdate, writeRange])

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      let sid = sheetId
      if (!initialized.current) {
        sid = await ensureSheet()
        setSheetId(sid)
        initialized.current = true
      }
      const rows = await readRange(`${SHEET_NAME}!A:F`)
      setCandidates(
        rows.slice(1)
          .map((r, i) => ({ r, sheetRow: i + 2 }))
          .filter(({ r }) => r && r[0])
          .map(({ r, sheetRow }) => ({
            sheetRow,
            name: r[0] || '',
            price: parseAmount(r[1]),
            loan: parseAmount(r[2]),
            rate: parseAmount(r[3]) || 0.045,
            interior: parseAmount(r[4]),
            memo: r[5] || '',
          }))
      )
    } finally {
      setLoading(false)
    }
  }, [accessToken, ensureSheet, readRange, sheetId])

  useEffect(() => {
    if (accessToken) load()
  }, [accessToken, load])

  const addCandidate = useCallback(async (candidate) => {
    await appendRange(`${SHEET_NAME}!A:F`, [[
      candidate.name,
      candidate.price,
      candidate.loan,
      candidate.rate,
      candidate.interior,
      candidate.memo || '',
    ]])
    await load()
  }, [appendRange, load])

  const updateCandidate = useCallback(async (sheetRow, candidate) => {
    await writeRange(`${SHEET_NAME}!A${sheetRow}:F${sheetRow}`, [[
      candidate.name,
      candidate.price,
      candidate.loan,
      candidate.rate,
      candidate.interior,
      candidate.memo || '',
    ]])
    await load()
  }, [writeRange, load])

  const deleteCandidate = useCallback(async (sheetRow) => {
    if (sheetId === null) return
    await batchUpdate([{
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: sheetRow - 1,
          endIndex: sheetRow,
        },
      },
    }])
    await load()
  }, [sheetId, batchUpdate, load])

  return { candidates, loading, addCandidate, updateCandidate, deleteCandidate, reload: load }
}
