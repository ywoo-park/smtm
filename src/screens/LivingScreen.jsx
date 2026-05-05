import { formatKRW } from '../utils/format'

const TYPE_CLASS = {
  '수입': 'pos',
  '저축': 'primary',
  '고정지출': 'neg',
  '변동지출': 'neg',
}

function LivingRow({ item }) {
  return (
    <div className="living-row">
      <div className="living-row-left">
        <span className="living-row-name">{item.name}</span>
        <span className="living-row-type">{item.type}</span>
      </div>
      <div className="living-row-amounts">
        <span className="living-row-person">{item.young !== 0 ? formatKRW(item.young) : '—'}</span>
        <span className="living-row-person">{item.yuri !== 0 ? formatKRW(item.yuri) : '—'}</span>
        <span className={`living-row-total ${TYPE_CLASS[item.type] || ''}`}>{formatKRW(item.total)}</span>
      </div>
    </div>
  )
}

export function LivingScreen({ livingData, loading, onReload }) {
  const { sections, remaining } = livingData

  if (loading && sections.length === 0) {
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
        <h2 className="section-title">월 생활비</h2>
        <button className="btn-refresh" onClick={onReload} disabled={loading} aria-label="새로고침">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>

      <div className="living-header-row">
        <span />
        <div className="living-row-amounts">
          <span className="living-col-label">영우</span>
          <span className="living-col-label">가율</span>
          <span className="living-col-label">합계</span>
        </div>
      </div>

      {sections.map(section => (
        <div key={section.title} className="living-section">
          <p className="living-section-title">{section.title}</p>
          <div className="living-section-items">
            {section.items.map(item => (
              <LivingRow key={item.name} item={item} />
            ))}
          </div>
        </div>
      ))}

      {remaining && (
        <div className={`living-remaining ${remaining.total < 0 ? 'neg-bg' : remaining.total > 0 ? 'pos-bg' : ''}`}>
          <span className="living-remaining-label">월 잔여</span>
          <div className="living-row-amounts">
            <span className={`living-remaining-val ${remaining.young < 0 ? 'neg' : remaining.young > 0 ? 'pos' : ''}`}>
              {formatKRW(remaining.young)}
            </span>
            <span className={`living-remaining-val ${remaining.yuri < 0 ? 'neg' : remaining.yuri > 0 ? 'pos' : ''}`}>
              {formatKRW(remaining.yuri)}
            </span>
            <span className={`living-remaining-val ${remaining.total < 0 ? 'neg' : remaining.total > 0 ? 'pos' : ''}`}>
              {formatKRW(remaining.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
