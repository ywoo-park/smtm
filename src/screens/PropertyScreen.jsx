import { useState } from 'react'
import { formatKRW, formatKRWFull } from '../utils/format'

const STATUS_CYCLE = ['미납', '대기', '진행중', '완료']

const STATUS_LABELS = {
  '완료': { label: '납입 완료', className: 'badge-done' },
  '진행중': { label: '진행중', className: 'badge-partial' },
  '대출': { label: '대출', className: 'badge-partial' },
  '대기': { label: '대기', className: 'badge-pending' },
  '미납': { label: '미납', className: 'badge-pending' },
}

function PropertyItem({ item, onUpdateStatus }) {
  const [saving, setSaving] = useState(false)
  const s = STATUS_LABELS[item.status] || STATUS_LABELS['미납']

  const handleStatusCycle = async () => {
    const idx = STATUS_CYCLE.indexOf(item.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    setSaving(true)
    try {
      await onUpdateStatus(item.sheetRow, next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="property-item">
      <div className="property-item-top">
        <div>
          <p className="property-item-stage">{item.stage}</p>
          <p className="property-item-name">{item.name}</p>
          {item.paidAmount > 0 && item.paidAmount !== item.amount && (
            <p className="property-item-paid">납입 {formatKRW(item.paidAmount)}</p>
          )}
        </div>
        <div className="property-item-right">
          <p className="property-item-amount">{formatKRW(item.amount)}</p>
          <button
            className={`badge ${s.className} badge-btn`}
            onClick={handleStatusCycle}
            disabled={saving}
          >
            {saving ? '...' : s.label}
          </button>
        </div>
      </div>
    </div>
  )
}

export function PropertyScreen({ config, propertyItems, loading, onUpdateStatus, onReload }) {
  const aptPrice = config.APT_PRICE || 0
  const loanAmount = config.LOAN_AMOUNT || 0
  const loanRate = config.LOAN_RATE || 0.052
  const movingTotal = config.MOVING_TOTAL || 0

  const monthlyInterest = Math.round(loanAmount * loanRate / 12)
  const equity = aptPrice - loanAmount
  const paidAmount = propertyItems
    .filter(i => i.status === '완료')
    .reduce((sum, i) => sum + i.amount, 0)
  const totalAmount = propertyItems.reduce((sum, i) => sum + i.amount, 0)
  const progressPct = totalAmount > 0 ? Math.min(100, Math.round(paidAmount / totalAmount * 100)) : 0

  if (loading && propertyItems.length === 0) {
    return (
      <div className="screen loading-screen">
        <div className="spinner" />
        <p>데이터 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="section-header section-header-row">
        <h2 className="section-title">아파트 매매</h2>
        <button className="btn-refresh" onClick={onReload} disabled={loading} aria-label="새로고침">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>

      <div className="property-hero">
        <div className="property-hero-row">
          <div className="property-hero-item">
            <p className="property-hero-label">집값</p>
            <p className="property-hero-amount">{formatKRW(aptPrice)}</p>
          </div>
          <div className="property-hero-item">
            <p className="property-hero-label">자기자본</p>
            <p className="property-hero-amount pos">{formatKRW(equity < 0 ? movingTotal : equity)}</p>
          </div>
          <div className="property-hero-item">
            <p className="property-hero-label">대출</p>
            <p className="property-hero-amount neg">{formatKRW(loanAmount)}</p>
          </div>
        </div>
      </div>

      <div className="loan-card">
        <div className="loan-card-row">
          <span className="loan-label">월 대출 이자</span>
          <span className="loan-amount neg">{formatKRW(monthlyInterest)}/월</span>
        </div>
        <div className="loan-card-row">
          <span className="loan-label">연이율</span>
          <span className="loan-rate">{(loanRate * 100).toFixed(1)}%</span>
        </div>
        <div className="loan-card-row">
          <span className="loan-label">대출 원금</span>
          <span className="loan-amount">{formatKRWFull(loanAmount)}</span>
        </div>
      </div>

      <div className="property-progress-wrap">
        <div className="property-progress-header">
          <span>납입 현황</span>
          <span>{formatKRW(paidAmount)} / {formatKRW(totalAmount)}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill property-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {propertyItems.length === 0 ? (
        <div className="empty-state">
          <p>매매비용 탭에 데이터를 입력해주세요</p>
        </div>
      ) : (
        <div className="property-items">
          {propertyItems.map(item => (
            <PropertyItem key={item.sheetRow} item={item} onUpdateStatus={onUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  )
}
