import { useState, useEffect, useCallback } from 'react'
import { useGoogleSheets } from './useGoogleSheets'
import { parseConfig, parseAmount } from '../utils/format'

function parseLiving(rows) {
  const sections = []
  let current = null
  let remaining = null

  rows.slice(2).forEach(r => {
    if (!r || !r[0]) return
    const name = r[0].toString().trim()
    const type = r[1] ? r[1].toString().trim() : ''

    if (name === '월 잔여') {
      remaining = {
        young: parseAmount(r[2]),
        yuri: parseAmount(r[3]),
        total: parseAmount(r[4]),
      }
      return
    }

    if (!type) {
      current = { title: name, items: [] }
      sections.push(current)
      return
    }

    if (current) {
      current.items.push({
        name,
        type,
        young: parseAmount(r[2]),
        yuri: parseAmount(r[3]),
        total: parseAmount(r[4]),
      })
    }
  })

  return { sections, remaining }
}

export function useAppData(accessToken) {
  const { readRange, writeRange } = useGoogleSheets(accessToken)
  const [config, setConfig] = useState({})
  const [weddingItems, setWeddingItems] = useState([])
  const [propertyItems, setPropertyItems] = useState([])
  const [livingData, setLivingData] = useState({ sections: [], remaining: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const [configRows, weddingRows, propertyRows, livingRows] = await Promise.all([
        readRange('설정!A:B'),
        readRange('결혼비용!A:F'),
        readRange('매매비용!A:F'),
        readRange('생활비!A:E'),
      ])

      setConfig(parseConfig(configRows))

      // 카테고리 헤더 행이 중간에 있으므로 실제 시트 행 번호를 추적
      setWeddingItems(
        weddingRows.slice(1)
          .map((r, i) => ({ r, sheetRow: i + 2 }))
          .filter(({ r }) => r && r[1])
          .map(({ r, sheetRow }) => ({
            sheetRow,
            category: r[0] || '',
            name: r[1] || '',
            budget: parseAmount(r[2]),
            actual: parseAmount(r[3]),
            status: r[5] || '미납',
          }))
      )

      setPropertyItems(
        propertyRows.slice(1)
          .filter(r => r && r[1])
          .map((r, i) => ({
            sheetRow: i + 2,
            stage: r[0] || '',
            name: r[1] || '',
            amount: parseAmount(r[2]),
            paidAmount: parseAmount(r[3]),
            status: r[5] || '미납',
          }))
      )

      setLivingData(parseLiving(livingRows))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [accessToken, readRange])

  useEffect(() => {
    if (accessToken) load()
  }, [accessToken])

  return {
    config,
    weddingItems,
    propertyItems,
    livingData,
    loading,
    error,
    reload: load,
  }
}
