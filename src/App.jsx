import { useState } from 'react'
import { useGoogleAuth } from './hooks/useGoogleAuth'
import { useAppData } from './hooks/useAppData'
import { usePropertyCandidates } from './hooks/usePropertyCandidates'
import { LoginScreen } from './components/LoginScreen'
import { BottomNav } from './components/BottomNav'
import { HomeScreen } from './screens/HomeScreen'
import { SimulationScreen } from './screens/SimulationScreen'
import { WeddingScreen } from './screens/WeddingScreen'
import { PropertyScreen } from './screens/PropertyScreen'
import { ProfitScreen } from './screens/ProfitScreen'

export default function App() {
  const { accessToken, user, signIn, signOut, isSignedIn, gisReady, autoLogging } = useGoogleAuth()
  const {
    config, weddingItems, propertyItems, livingData,
    loading, error, reload, updateWeddingActual, updatePropertyStatus,
  } = useAppData(accessToken)
  const {
    candidates, loading: profitLoading,
    addCandidate, updateCandidate, deleteCandidate, reload: reloadCandidates,
  } = usePropertyCandidates(accessToken)
  const [activeTab, setActiveTab] = useState('home')

  if (autoLogging) {
    return (
      <div className="loading-screen" style={{ height: '100dvh' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <LoginScreen onSignIn={signIn} gisReady={gisReady} />
  }

  if (error) {
    return (
      <div className="error-screen">
        <p className="error-title">오류가 발생했습니다</p>
        <p className="error-msg">{error}</p>
        <button className="btn-primary" onClick={signOut}>다시 로그인</button>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="app-content">
        {activeTab === 'home' && (
          <HomeScreen
            config={config}
            weddingItems={weddingItems}
            propertyItems={propertyItems}
            loading={loading}
            user={user}
            onSignOut={signOut}
            onReload={reload}
          />
        )}
        {activeTab === 'sim' && (
          <SimulationScreen
            config={config}
            weddingItems={weddingItems}
            propertyItems={propertyItems}
          />
        )}
        {activeTab === 'wedding' && (
          <WeddingScreen
            weddingItems={weddingItems}
            loading={loading}
            onUpdateActual={updateWeddingActual}
            onReload={reload}
          />
        )}
        {activeTab === 'property' && (
          <PropertyScreen
            config={config}
            propertyItems={propertyItems}
            loading={loading}
            onUpdateStatus={updatePropertyStatus}
            onReload={reload}
          />
        )}
        {activeTab === 'profit' && (
          <ProfitScreen
            config={config}
            candidates={candidates}
            loading={profitLoading}
            onAdd={addCandidate}
            onUpdate={updateCandidate}
            onDelete={deleteCandidate}
            onReload={reloadCandidates}
          />
        )}
      </div>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}
