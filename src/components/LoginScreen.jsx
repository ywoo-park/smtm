export function LoginScreen({ onSignIn, gisReady }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-ring">S</div>
          <h1 className="login-title">SHOW ME THE MONEY</h1>
          <p className="login-subtitle">영우 × 가율 자산 관리</p>
        </div>

        <div className="login-info">
          <div className="login-info-row">
            <span className="login-info-icon">🏠</span>
            <span>아파트 매매 현황 추적</span>
          </div>
          <div className="login-info-row">
            <span className="login-info-icon">💰</span>
            <span>자산 시뮬레이션</span>
          </div>
          <div className="login-info-row">
            <span className="login-info-icon">💍</span>
            <span>결혼비용 항목 관리</span>
          </div>
        </div>

        <button
          className="login-btn"
          onClick={onSignIn}
          disabled={!gisReady}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.7 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.8 13.4l7.8 6.1C12.5 13.1 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 2.9-2.2 5.4-4.7 7.1l7.3 5.7c4.3-3.9 6.8-9.7 6.8-16.8z"/>
            <path fill="#FBBC05" d="M10.6 28.6c-.6-1.7-.9-3.5-.9-5.4s.3-3.7.9-5.4L2.8 11.7C1 15.1 0 18.9 0 23.2s1 8.1 2.8 11.5l7.8-6.1z"/>
            <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.3-5.7c-2 1.4-4.6 2.2-7.9 2.2-6.2 0-11.5-4.2-13.4-9.9l-7.8 6.1C6.7 43 14.7 48 24 48z"/>
          </svg>
          {gisReady ? 'Google로 로그인' : '로딩 중...'}
        </button>

        <p className="login-notice">구글 계정으로 로그인하여 Google Sheets 데이터에 접근합니다</p>
      </div>
    </div>
  )
}
