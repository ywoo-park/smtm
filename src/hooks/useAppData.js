import { useState, useEffect, useCallback } from 'react'
import { useGoogleSheets } from './useGoogleSheets'
import { parseConfig, parseAmount } from '../utils/format'

export function useAppData(accessToken) {
  const { readRange, writeRange } = useGoogleSheets(accessToken)
  const [config, setConfig] = useState({})
  const [weddingItems, setWeddingItems] = useState([])
  const [propertyItems, setPropertyItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const [configRows, weddingRows, propertyRows] = await Promise.all([
        readRange('설정!A:B'),
        readRange('결혼비용!A:E'),
        readRange('매매비용!A:D'),
      ])

      setConfig(parseConfig(configRows))

      setWeddingItems(
        weddingRows.slice(1)
          .filter(r => r && r[1])
          .map(r => ({
            category: r[0] || '',
            name: r[1] || '',
            budget: parseAmount(r[2]),
            actual: parseAmount(r[3]),
            status: r[4] || '미납'
          }))
      )

      setPropertyItems(
        propertyRows.slice(1)
          .filter(r => r && r[1])
          .map(r => ({
            stage: r[0] || '',
            name: r[1] || '',
            amount: parseAmount(r[2]),
            status: r[3] || '미납'
          }))
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [accessToken, readRange])

  useEffect(() => {
    if (accessToken) load()
  }, [accessToken])

  const updateWeddingItem = useCallback(async (index, { status, actual }) => {
    const sheetRow = index + 2
    const ops = []
    if (actual !== undefined) {
      ops.push(writeRange(`결혼비용!D${sheetRow}`, [[actual.toString()]]))
    }
    if (status !== undefined) {
      ops.push(writeRange(`결혼비용!E${sheetRow}`, [[status]]))
    }
    await Promise.all(ops)
    await load()
  }, [writeRange, load])

  const updatePropertyItem = useCallback(async (index, status) => {
    const sheetRow = index + 2
    await writeRange(`매매비용!D${sheetRow}`, [[status]])
    await load()
  }, [writeRange, load])

  return {
    config,
    weddingItems,
    propertyItems,
    loading,
    error,
    reload: load,
    updateWeddingItem,
    updatePropertyItem
  }
}
