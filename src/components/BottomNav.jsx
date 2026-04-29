const TABS = [
  {
    id: 'home',
    label: '홈',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 'sim',
    label: '시뮬',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2"/>
        <path d="M8 12H16M8 8H12M8 16H14" stroke={active ? 'white' : 'currentColor'} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'wedding',
    label: '결혼비용',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  },
  {
    id: 'property',
    label: '매매',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 21H21M3 7L12 2L21 7V21H3V7Z"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M9 21V12H15V21" stroke={active ? 'white' : 'currentColor'} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'living',
    label: '생활비',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2"/>
        <path d="M12 7V12L15 14" stroke={active ? 'white' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
]

export function BottomNav({ activeTab, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`bottom-nav-item${activeTab === tab.id ? ' active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon(activeTab === tab.id)}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
