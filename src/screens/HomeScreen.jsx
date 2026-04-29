import { formatKRW, getDday } from '../utils/format'

export function HomeScreen({ config, weddingItems, propertyItems, loading, onSignOut, user }) {
  const currentAssets = config.CURRENT_ASSETS || 0
  const youngAssets = config.YOUNG_ASSETS || 0
  const yuriAssets = config.YURI_ASSETS || 0
  const targetDate = config.TARGET_DATE || ''
  const monthlySaving = config.MONTHLY_SAVING || 0
  const giftMoney = config.GIFT_MONEY || 0
  const weddingTotal = config.WEDDING_TOTAL || 0
  const movingTotal = config.MOVING_TOTAL || 0
  const loanAmount = config.LOAN_AMOUNT || 0
  const loanRate = config.LOAN_RATE || 0.052

  const dday = getDday(targetDate)
  const months = dday != null ? Math.max(0, Math.ceil(dday / 30)) : 6
  const remainAfterAll = currentAssets + monthlySaving * months + giftMoney - weddingTotal - movingTotal
  const monthlyInterest = Math.round(loanAmount * loanRate / 12)

  const weddingSpent = weddingItems.reduce((sum, item) => sum + (item.actual || 0), 0)
  const weddingBudget = weddingItems.reduce((sum, item) => sum + (item.budget || 0), 0)
  const weddingRemain = (weddingBudget || weddingTotal) - weddingSpent

  const propertyPaid = propertyItems
    .filter(item => item.status === '완료')
    .reduce((sum, item) => sum + item.amount, 0)
  const totalPropertyAmt = propertyItems.reduce((sum, item) => sum + item.amount, 0)
  const propertyProgress = totalPropertyAmt > 0 ? Math.round((propertyPaid / totalPropertyAmt) * 100) : 0

  if (loading) {
    return (
      <div className="screen loading-screen">
        <div className="spinner" />
        <p>데이터 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="screen">
      {/* 히어로 카드 */}
      <div className="hero-card">
        <div className="hero-card-header">
          <div>
            <p className="hero-label">합산 현재 자산</p>
            <h2 className="hero-amount">{formatKRW(currentAssets)}</h2>
          </div>
          <div className="hero-user" onClick={onSignOut} title="로그아웃">
            <span className="hero-user-name">{user?.name?.split(' ')[0] || '로그아웃'}</span>
          </div>
        </div>
        <div className="hero-members">
          <div className="hero-member">
            <span className="hero-member-name">영우</span>
            <span className="hero-member-amount">{formatKRW(youngAssets)}</span>
          </div>
          <div className="hero-divider" />
          <div className="hero-member">
            <span className="hero-member-name">가율</span>
            <span className="hero-member-amount">{formatKRW(yuriAssets)}</span>
          </div>
        </div>
        {targetDate && (
          <p className="hero-date-hint">{targetDate} 기준</p>
        )}
      </div>

      {/* 잔여 현금 전폭 카드 */}
      <div className={`remain-card ${remainAfterAll < 0 ? 'remain-neg' : 'remain-pos'}`}>
        <p className="remain-label">목표 시점 잔여 현금</p>
        <p className="remain-amount">{formatKRW(remainAfterAll)}</p>
        <p className="remain-sub">{months}개월 후 · 결혼+매매 후 기준</p>
      </div>

      {/* 요약 그리드 */}
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-label">결혼비용 잔여</p>
          <p className={`summary-amount ${weddingRemain < 0 ? 'neg' : ''}`}>
            {formatKRW(weddingRemain)}
          </p>
          <p className="summary-sub">총 {formatKRW(weddingBudget || weddingTotal)}</p>
        </div>

        <div className="summary-card">
          <p className="summary-label">월 이자</p>
          <p className="summary-amount neg">{formatKRW(monthlyInterest)}</p>
          <p className="summary-sub">{(loanRate * 100).toFixed(1)}% 연이율</p>
        </div>

        <div className="summary-card">
          <p className="summary-label">매매 진행</p>
          <p className="summary-amount neutral">{propertyProgress}%</p>
          <p className="summary-sub">{formatKRW(propertyPaid)} 납입</p>
        </div>

        <div className="summary-card">
          <p className="summary-label">월 합산 적립</p>
          <p className="summary-amount pos">{formatKRW(monthlySaving)}</p>
          <p className="summary-sub">영우 + 가율</p>
        </div>
      </div>
    </div>
  )
}
