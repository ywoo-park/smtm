export function formatKRW(amount) {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  if (abs >= 100000000) {
    const uk = Math.floor(abs / 100000000)
    const man = Math.floor((abs % 100000000) / 10000)
    return man > 0 ? `${sign}${uk}억 ${man.toLocaleString()}만` : `${sign}${uk}억`
  }
  if (abs >= 10000) {
    return `${sign}${Math.floor(abs / 10000).toLocaleString()}만`
  }
  return `${sign}${abs.toLocaleString()}원`
}

export function formatKRWFull(amount) {
  return amount.toLocaleString() + '원'
}

export function getDday(targetDateStr) {
  if (!targetDateStr) return null
  const target = new Date(targetDateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

export function parseAmount(value) {
  if (value == null || value === '') return 0
  return parseFloat(value.toString().replace(/[^0-9.-]/g, '')) || 0
}

export function parseConfig(rows) {
  const config = {}
  rows.forEach(row => {
    if (!row || !row[0]) return
    const key = row[0].toString().trim()
    const raw = row[1] ? row[1].toString().trim() : ''
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      config[key] = raw
    } else {
      const num = parseFloat(raw.replace(/[^0-9.]/g, ''))
      config[key] = isNaN(num) ? raw : num
    }
  })
  return config
}
