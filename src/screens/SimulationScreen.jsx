import { useState } from 'react'
import { formatKRW } from '../utils/format'

const MONTH_OPTIONS = [3, 6, 9, 12]

export function SimulationScreen({ config }) {
  const currentAssets = config.CURRENT_ASSETS || 0
  const monthlySaving = config.MONTHLY_SAVING || 0
  const defaultGift = config.GIFT_MONEY || 0
  const weddingTotal = config.WEDDING_TOTAL || 0
  const movingTotal = config.MOVING_TOTAL || 0
  const defaultAptPrice = config.APT_PRICE || 850000000

  const [months, setMonths] = useState(6)
  const [giftMoney, setGiftMoney] = useState(defaultGift)
  const [aptPrice, setAptPrice] = useState(defaultAptPrice)

  const LIVING_COST = 75000000 // 인테리어 5000만 + 혼수가전 2500만
  const savingsTotal = monthlySaving * months
  const adjustedMovingTotal = movingTotal + (aptPrice - defaultAptPrice)
  const propertyCost = adjustedMovingTotal - LIVING_COST
  const remainAfterAll = currentAssets + savingsTotal + giftMoney - weddingTotal - adjustedMovingTotal

  const breakdown = [
    { label: '현재 자산', amount: currentAssets, type: 'pos' },
    { label: `월 적립 (${months}개월)`, amount: savingsTotal, type: 'pos' },
    { label: '축의금', amount: giftMoney, type: 'pos' },
    { label: '결혼비용', amount: -weddingTotal, type: 'neg' },
    { label: '매매 자기자본 (계약금·잔여·취득세)', amount: -propertyCost, type: 'neg' },
    { label: '인테리어·혼수가전', amount: -LIVING_COST, type: 'neg' },
  ]

  return (
    <div className="screen">
      <div className="section-header">
        <h2 className="section-title">잔여 자산 시뮬레이션</h2>
      </div>

      {/* 개월 수 선택 */}
      <div className="sim-card">
        <p className="sim-field-label">목표 시점</p>
        <div className="chip-group">
          {MONTH_OPTIONS.map(m => (
            <button
              key={m}
              className={`chip${months === m ? ' active' : ''}`}
              onClick={() => setMonths(m)}
            >
              {m}개월
            </button>
          ))}
        </div>
      </div>

      {/* 축의금 슬라이더 */}
      <div className="sim-card">
        <div className="sim-field-header">
          <p className="sim-field-label">예상 축의금</p>
          <span className="sim-field-value">{formatKRW(giftMoney)}</span>
        </div>
        <input
          type="range"
          className="slider"
          min={0}
          max={100000000}
          step={1000000}
          value={giftMoney}
          onChange={e => setGiftMoney(Number(e.target.value))}
        />
        <div className="slider-labels">
          <span>0</span>
          <span>5000만</span>
          <span>1억</span>
        </div>
      </div>

      {/* 집값 슬라이더 */}
      <div className="sim-card">
        <div className="sim-field-header">
          <p className="sim-field-label">집값</p>
          <span className="sim-field-value">{formatKRW(aptPrice)}</span>
        </div>
        <input
          type="range"
          className="slider"
          min={700000000}
          max={1200000000}
          step={10000000}
          value={aptPrice}
          onChange={e => setAptPrice(Number(e.target.value))}
        />
        <div className="slider-labels">
          <span>7억</span>
          <span>9.5억</span>
          <span>12억</span>
        </div>
      </div>

      {/* 결과 카드 */}
      <div className={`result-card ${remainAfterAll >= 0 ? 'result-pos' : 'result-neg'}`}>
        <p className="result-label">{months}개월 후 지출 후 잔여</p>
        <p className="result-amount">{formatKRW(remainAfterAll)}</p>
        {remainAfterAll < 0 && (
          <p className="result-warning">자기자본이 부족합니다</p>
        )}
      </div>

      {/* 내역 */}
      <div className="breakdown-card">
        <p className="breakdown-title">세부 내역</p>
        {breakdown.map((item, i) => (
          <div key={i} className="breakdown-row">
            <span className="breakdown-label">{item.label}</span>
            <span className={`breakdown-amount ${item.type}`}>
              {item.amount >= 0 ? '+' : ''}{formatKRW(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
