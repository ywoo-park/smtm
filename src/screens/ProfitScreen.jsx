import { useState, useEffect, useRef } from 'react'
import { formatKRW } from '../utils/format'

const HOLD_YEAR_OPTIONS = [3, 5, 7, 10]
const CHART_YEARS = [1, 3, 5, 7, 10]

function getAcquisitionTax(price) {
  if (price <= 600_000_000) return price * 0.01
  if (price <= 900_000_000) return price * 0.02
  return price * 0.03
}

function getAgentFee(price) {
  if (price <= 600_000_000) return price * 0.004
  if (price <= 900_000_000) return price * 0.005
  return price * 0.009
}

function calcProfit(candidate, appreciationRate, holdYears, interior) {
  const { price, loan, rate } = candidate
  const equity = price - loan

  const acquisitionTax = getAcquisitionTax(price)
  const buyAgentFee = getAgentFee(price)

  const annualInterest = loan * rate
  const annualPropertyTax = price * 0.001
  const annualHoldingCost = annualInterest + annualPropertyTax

  const futurePrice = price * Math.pow(1 + appreciationRate, holdYears)
  const sellAgentFee = getAgentFee(futurePrice)

  const totalDeductions = acquisitionTax + buyAgentFee + interior
    + annualHoldingCost * holdYears + sellAgentFee
  const capitalGain = futurePrice - price
  const netProfit = capitalGain - totalDeductions

  const totalReturn = equity > 0 ? netProfit / equity : 0
  const annualRate = holdYears > 0
    ? ((Math.pow(1 + totalReturn, 1 / holdYears) - 1) * 100).toFixed(1)
    : '0.0'

  return {
    futurePrice, equity, capitalGain,
    acquisitionTax, buyAgentFee,
    annualInterest, annualPropertyTax,
    sellAgentFee, netProfit, annualRate,
  }
}

function YearChart({ candidate, appreciationRate, interior }) {
  const profits = CHART_YEARS.map(y => ({
    year: y,
    profit: calcProfit(candidate, appreciationRate, y, interior).netProfit,
  }))
  const maxAbs = Math.max(...profits.map(p => Math.abs(p.profit)), 1)

  return (
    <div className="year-chart">
      {profits.map(({ year, profit }) => (
        <div key={year} className="year-chart-row">
          <span className="year-chart-label">{year}년</span>
          <div className="year-chart-bar-track">
            <div
              className={`year-chart-bar ${profit >= 0 ? 'pos-bar' : 'neg-bar'}`}
              style={{ width: `${Math.abs(profit) / maxAbs * 100}%` }}
            />
          </div>
          <span className={`year-chart-value ${profit >= 0 ? 'pos' : 'neg'}`}>
            {profit >= 0 ? '+' : ''}{formatKRW(profit)}
          </span>
        </div>
      ))}
    </div>
  )
}

function CostBreakdown({ candidate, result, holdYears, interior }) {
  const rows = [
    { label: `${holdYears}년 후 예상 매도가`, amount: result.futurePrice },
    { label: '현재 매수가', amount: -candidate.price },
    { label: '취득세', amount: -result.acquisitionTax },
    { label: '매수 중개수수료', amount: -result.buyAgentFee },
    { label: '인테리어', amount: -interior },
    { label: `대출이자 (${holdYears}년)`, amount: -result.annualInterest * holdYears },
    { label: `재산세 (${holdYears}년)`, amount: -result.annualPropertyTax * holdYears },
    { label: '매도 중개수수료', amount: -result.sellAgentFee },
  ]

  return (
    <div className="profit-breakdown">
      {rows.map((row, i) => (
        <div key={i} className="breakdown-row">
          <span className="breakdown-label">{row.label}</span>
          <span className={`breakdown-amount ${row.amount >= 0 ? 'pos' : 'neg'}`}>
            {row.amount >= 0 ? '+' : ''}{formatKRW(row.amount)}
          </span>
        </div>
      ))}
      <div className="breakdown-divider" />
      <div className="breakdown-row breakdown-total">
        <span className="breakdown-label">순수익</span>
        <span className={`breakdown-amount ${result.netProfit >= 0 ? 'pos' : 'neg'}`}>
          {result.netProfit >= 0 ? '+' : ''}{formatKRW(result.netProfit)}
        </span>
      </div>
    </div>
  )
}

function CandidateCard({ candidate, appreciationRate, holdYears, interior, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const result = calcProfit(candidate, appreciationRate, holdYears, interior)
  const isPositive = result.netProfit >= 0

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(candidate.sheetRow)
  }

  const startEdit = () => {
    setEditForm({
      name: candidate.name,
      priceOk: String(candidate.price / 1e8),
      loanOk: String(candidate.loan / 1e8),
      rateP: String((candidate.rate * 100).toFixed(2)),
      memo: candidate.memo,
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(candidate.sheetRow, {
        name: editForm.name,
        price: parseFloat(editForm.priceOk || '0') * 1e8,
        loan: parseFloat(editForm.loanOk || '0') * 1e8,
        rate: parseFloat(editForm.rateP || '0') / 100,
        memo: editForm.memo,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const setField = (key) => (e) => setEditForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className={`profit-card ${expanded ? 'expanded' : ''}`}>
      <div className="profit-card-main" onClick={() => !editing && setExpanded(e => !e)}>
        <div className="profit-card-info">
          <p className="profit-card-name">{candidate.name}</p>
          <p className="profit-card-meta">
            {formatKRW(candidate.price)} · 자기자본 {formatKRW(result.equity)}
          </p>
          {candidate.memo && <p className="profit-card-memo">{candidate.memo}</p>}
        </div>
        <div className="profit-card-result">
          <p className={`profit-card-net ${isPositive ? 'pos' : 'neg'}`}>
            {isPositive ? '+' : ''}{formatKRW(result.netProfit)}
          </p>
          <p className="profit-card-rate">{result.annualRate}%/년</p>
        </div>
        <span className={`profit-chevron ${expanded ? 'open' : ''}`}>›</span>
      </div>

      {expanded && !editing && (
        <div className="profit-card-detail">
          <p className="profit-detail-section-label">연도별 순수익</p>
          <YearChart candidate={candidate} appreciationRate={appreciationRate} interior={interior} />

          <p className="profit-detail-section-label">비용 내역</p>
          <CostBreakdown candidate={candidate} result={result} holdYears={holdYears} interior={interior} />

          <div className="profit-card-actions">
            <button className="btn-sm btn-ghost" onClick={startEdit}>편집</button>
            {confirmDelete ? (
              <>
                <span className="profit-delete-confirm">삭제할까요?</span>
                <button className="btn-sm btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? '...' : '삭제'}
                </button>
                <button className="btn-sm btn-ghost" onClick={() => setConfirmDelete(false)}>취소</button>
              </>
            ) : (
              <button className="btn-sm btn-ghost" onClick={() => setConfirmDelete(true)}>삭제</button>
            )}
          </div>
        </div>
      )}

      {expanded && editing && (
        <div className="profit-card-detail">
          <div className="edit-form">
            <div className="form-field">
              <label className="form-label">단지명</label>
              <input className="form-input" value={editForm.name} onChange={setField('name')} />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">집값 (억)</label>
                <input className="form-input" type="number" step="0.1" value={editForm.priceOk} onChange={setField('priceOk')} />
              </div>
              <div className="form-field">
                <label className="form-label">대출금 (억)</label>
                <input className="form-input" type="number" step="0.1" value={editForm.loanOk} onChange={setField('loanOk')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">금리 (%)</label>
                <input className="form-input" type="number" step="0.1" value={editForm.rateP} onChange={setField('rateP')} />
              </div>
              <div className="form-field">
                <label className="form-label">메모</label>
                <input className="form-input" value={editForm.memo} onChange={setField('memo')} />
              </div>
            </div>
            <div className="profit-card-actions">
              <button className="btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
              <button className="btn-sm btn-ghost" onClick={() => setEditing(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AddCandidateForm({ onAdd, defaultRate }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', priceOk: '', loanOk: '', rateP: '', memo: '',
  })

  const synced = useRef(false)
  useEffect(() => {
    if (!synced.current && defaultRate > 0) {
      synced.current = true
      setForm(f => ({ ...f, rateP: String((defaultRate * 100).toFixed(2)) }))
    }
  }, [defaultRate])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleAdd = async () => {
    if (!form.name || !form.priceOk) return
    setSaving(true)
    try {
      await onAdd({
        name: form.name,
        price: parseFloat(form.priceOk) * 1e8,
        loan: parseFloat(form.loanOk || '0') * 1e8,
        rate: parseFloat(form.rateP || '4.5') / 100,
        memo: form.memo,
      })
      setForm({ name: '', priceOk: '', loanOk: '', rateP: form.rateP, memo: '' })
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button className="btn-add-candidate" onClick={() => setOpen(true)}>
        + 후보 단지 추가
      </button>
    )
  }

  return (
    <div className="add-candidate-form">
      <p className="add-candidate-title">후보 단지 추가</p>
      <div className="form-field">
        <label className="form-label">단지명</label>
        <input className="form-input" placeholder="래미안 OO" value={form.name} onChange={set('name')} autoFocus />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">집값 (억)</label>
          <input className="form-input" type="number" step="0.1" placeholder="8.5" value={form.priceOk} onChange={set('priceOk')} />
        </div>
        <div className="form-field">
          <label className="form-label">대출금 (억)</label>
          <input className="form-input" type="number" step="0.1" placeholder="5.95" value={form.loanOk} onChange={set('loanOk')} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">금리 (%)</label>
          <input className="form-input" type="number" step="0.1" placeholder="4.5" value={form.rateP} onChange={set('rateP')} />
        </div>
        <div className="form-field">
          <label className="form-label">메모</label>
          <input className="form-input" placeholder="선택사항" value={form.memo} onChange={set('memo')} />
        </div>
      </div>
      <div className="form-actions">
        <button
          className="btn-sm btn-primary"
          onClick={handleAdd}
          disabled={saving || !form.name || !form.priceOk}
        >
          {saving ? '추가 중...' : '추가'}
        </button>
        <button className="btn-sm btn-ghost" onClick={() => setOpen(false)}>취소</button>
      </div>
    </div>
  )
}

function CompareCard({ candidates, appreciationRate, holdYears, interior }) {
  const ranked = [...candidates].map(c => ({
    ...c,
    result: calcProfit(c, appreciationRate, holdYears, interior),
  })).sort((a, b) => b.result.netProfit - a.result.netProfit)

  const bestRate = [...ranked].sort((a, b) =>
    parseFloat(b.result.annualRate) - parseFloat(a.result.annualRate)
  )[0]
  const leastEquity = [...ranked].sort((a, b) => a.result.equity - b.result.equity)[0]

  return (
    <div className="compare-card">
      <p className="compare-card-title">{holdYears}년 · {(appreciationRate * 100).toFixed(1)}% 기준 비교</p>
      <div className="compare-rows">
        <div className="compare-row">
          <span className="compare-label">순수익 최고</span>
          <span className="compare-winner">{ranked[0].name}</span>
          <span className="compare-value pos">+{formatKRW(ranked[0].result.netProfit)}</span>
        </div>
        <div className="compare-row">
          <span className="compare-label">수익률 최고</span>
          <span className="compare-winner">{bestRate.name}</span>
          <span className="compare-value pos">{bestRate.result.annualRate}%/년</span>
        </div>
        <div className="compare-row">
          <span className="compare-label">초기자금 최소</span>
          <span className="compare-winner">{leastEquity.name}</span>
          <span className="compare-value neutral">{formatKRW(leastEquity.result.equity)}</span>
        </div>
      </div>
    </div>
  )
}

export function ProfitScreen({ config, candidates, loading, onAdd, onUpdate, onDelete, onReload }) {
  const [appreciationPct, setAppreciationPct] = useState(3)
  const [holdYears, setHoldYears] = useState(5)
  const [interior, setInterior] = useState(50_000_000)

  const appreciationRate = appreciationPct / 100
  const defaultRate = config.LOAN_RATE || 0.045

  if (loading && candidates.length === 0) {
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
        <h2 className="section-title">수익 분석</h2>
        <button className="btn-refresh" onClick={onReload} disabled={loading} aria-label="새로고침">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>

      {/* 연 상승률 슬라이더 */}
      <div className="sim-card">
        <div className="sim-field-header">
          <p className="sim-field-label">연 상승률</p>
          <span className="sim-field-value">
            {appreciationPct >= 0 ? '+' : ''}{appreciationPct.toFixed(1)}%
          </span>
        </div>
        <input
          type="range"
          className="slider"
          min={-3}
          max={8}
          step={0.5}
          value={appreciationPct}
          onChange={e => setAppreciationPct(Number(e.target.value))}
        />
        <div className="slider-labels">
          <span>-3%</span>
          <span>+2.5%</span>
          <span>+8%</span>
        </div>
      </div>

      {/* 보유 기간 세그먼트 */}
      <div className="sim-card">
        <p className="sim-field-label">보유 기간</p>
        <div className="segmented-control">
          {HOLD_YEAR_OPTIONS.map(y => (
            <button
              key={y}
              className={`segmented-btn${holdYears === y ? ' active' : ''}`}
              onClick={() => setHoldYears(y)}
            >
              {y}년
            </button>
          ))}
        </div>
      </div>

      {/* 인테리어 슬라이더 */}
      <div className="sim-card">
        <div className="sim-field-header">
          <p className="sim-field-label">인테리어</p>
          <span className="sim-field-value">{formatKRW(interior)}</span>
        </div>
        <input
          type="range"
          className="slider"
          min={0}
          max={100_000_000}
          step={5_000_000}
          value={interior}
          onChange={e => setInterior(Number(e.target.value))}
        />
        <div className="slider-labels">
          <span>0</span>
          <span>5,000만</span>
          <span>1억</span>
        </div>
      </div>

      {/* 비교 요약 */}
      {candidates.length >= 2 && (
        <CompareCard
          candidates={candidates}
          appreciationRate={appreciationRate}
          holdYears={holdYears}
          interior={interior}
        />
      )}

      {/* 후보 단지 목록 */}
      {candidates.length === 0 ? (
        <div className="empty-state">
          <p>아래 버튼으로 후보 단지를 추가해보세요</p>
          <p className="empty-sub">집값, 대출금, 금리를 입력하면<br />연도별 수익을 자동으로 계산합니다</p>
        </div>
      ) : (
        candidates.map(c => (
          <CandidateCard
            key={c.sheetRow}
            candidate={c}
            appreciationRate={appreciationRate}
            holdYears={holdYears}
            interior={interior}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))
      )}

      {/* 단지 추가 */}
      <AddCandidateForm onAdd={onAdd} defaultRate={defaultRate} />
    </div>
  )
}
