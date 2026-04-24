import { useState } from 'react'
import { formatKRW, formatKRWFull } from '../utils/format'

const STATUS_LABELS = {
  '완료': { label: '납입 완료', className: 'badge-done' },
  '예정': { label: '예정', className: 'badge-partial' },
  '미납': { label: '미납', className: 'badge-pending' },
}

function PropertyItem({ item, index, onUpdate }) {
  const [saving, setSaving] = useState(false)

  const handleStatus = async (status) => {
    setSaving(true)
    try {
      await onUpdate(index, status)
    } finally {
      setSaving(false)
    }
  }

  const s = STATUS_LABELS[item.status] || STATUS_LABELS['미납']

  return (
    <div className="property-item">
      <div className="property-item-top">
        <div>
          <p className="property-item-stage">{item.stage}</p>
          <p className="property-item-name">{item.name}</p>
        </div>
        <div className="property-item-right">
          <p className="property-item-amount">{formatKRW(item.amount)}</p>
          <span className={`badge ${s.className}`}>{s.label}</span>
        </div>
      </div>
      <div className="property-item-actions">
        {['미납', '예정', '완료'].map(st => (
          <button
            key={st}
            className={`btn-sm ${item.status === st ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleStatus(st)}
            disabled={saving || item.status === st}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  )
}

export function PropertyScreen({ config, propertyItems, updatePropertyItem, loading }) {
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
      <div className="section-header">
        <h2 className="section-title">아파트 매매</h2>
      </div>

      {/* 히어로 카드 */}
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

      {/* 대출 이자 */}
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

      {/* 납입 현황 */}
      <div className="property-progress-wrap">
        <div className="property-progress-header">
          <span>납입 현황</span>
          <span>{formatKRW(paidAmount)} / {formatKRW(totalAmount)}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill property-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* 항목 리스트 */}
      {propertyItems.length === 0 ? (
        <div className="empty-state">
          <p>매매비용 탭에 데이터를 입력해주세요</p>
          <p className="empty-sub">단계·항목명·금액·상태 순서로 입력</p>
        </div>
      ) : (
        <div className="property-items">
          {propertyItems.map((item, idx) => (
            <PropertyItem
              key={idx}
              item={item}
              index={idx}
              onUpdate={updatePropertyItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}
