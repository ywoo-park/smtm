import { formatKRW } from '../utils/format'

const STATUS_LABELS = {
  '완료': { label: '완료', className: 'badge-done' },
  '계약금': { label: '계약금', className: 'badge-partial' },
  '미납': { label: '미납', className: 'badge-pending' },
}

function WeddingItem({ item }) {
  const progress = item.budget > 0 ? Math.min(100, Math.round((item.actual / item.budget) * 100)) : 0
  const s = STATUS_LABELS[item.status] || STATUS_LABELS['미납']

  return (
    <div className="wedding-item">
      <div className="wedding-item-top">
        <div className="wedding-item-info">
          <span className="wedding-item-category">{item.category}</span>
          <span className="wedding-item-name">{item.name}</span>
        </div>
        <span className={`badge ${s.className}`}>{s.label}</span>
      </div>

      <div className="wedding-item-amounts">
        <span className="wedding-item-budget">예산 {formatKRW(item.budget)}</span>
        <span className="wedding-item-actual">실지출 {formatKRW(item.actual)}</span>
      </div>

      {item.budget > 0 && (
        <div className="progress-bar-wrap">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-pct">{progress}%</span>
        </div>
      )}
    </div>
  )
}

export function WeddingScreen({ weddingItems, loading }) {
  const totalBudget = weddingItems.reduce((s, i) => s + i.budget, 0)
  const totalActual = weddingItems.reduce((s, i) => s + i.actual, 0)
  const totalRemain = totalBudget - totalActual
  const doneCount = weddingItems.filter(i => i.status === '완료').length

  const categories = [...new Set(weddingItems.map(i => i.category))].filter(Boolean)

  if (loading && weddingItems.length === 0) {
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
        <h2 className="section-title">결혼비용</h2>
      </div>

      <div className="wedding-summary">
        <div className="wedding-summary-item">
          <p className="summary-label">총 예산</p>
          <p className="summary-amount neutral">{formatKRW(totalBudget)}</p>
        </div>
        <div className="wedding-summary-item">
          <p className="summary-label">지출 완료</p>
          <p className="summary-amount neg">{formatKRW(totalActual)}</p>
        </div>
        <div className="wedding-summary-item">
          <p className="summary-label">잔여</p>
          <p className={`summary-amount ${totalRemain >= 0 ? 'pos' : 'neg'}`}>{formatKRW(totalRemain)}</p>
        </div>
      </div>

      <div className="wedding-progress-wrap">
        <div className="wedding-progress">
          <div
            className="wedding-progress-fill"
            style={{ width: totalBudget > 0 ? `${Math.min(100, Math.round(totalActual / totalBudget * 100))}%` : '0%' }}
          />
        </div>
        <span className="wedding-progress-label">{doneCount}/{weddingItems.length}개 완료</span>
      </div>

      {weddingItems.length === 0 ? (
        <div className="empty-state">
          <p>결혼비용 탭에 데이터를 입력해주세요</p>
        </div>
      ) : (
        categories.map(cat => (
          <div key={cat} className="wedding-category-group">
            <p className="wedding-category-label">{cat}</p>
            {weddingItems
              .filter(item => item.category === cat)
              .map(item => (
                <WeddingItem key={item.sheetRow} item={item} />
              ))
            }
          </div>
        ))
      )}
    </div>
  )
}
