import { useState } from 'react'
import { useGoogleAuth } from './hooks/useGoogleAuth'
import { useAppData } from './hooks/useAppData'
import { LoginScreen } from './components/LoginScreen'
import { BottomNav } from './components/BottomNav'
import { HomeScreen } from './screens/HomeScreen'
import { SimulationScreen } from './screens/SimulationScreen'
import { WeddingScreen } from './screens/WeddingScreen'
import { PropertyScreen } from './screens/PropertyScreen'

export default function App() {
  const { accessToken, user, signIn, signOut, isSignedIn, gisReady } = useGoogleAuth()
  const { config, weddingItems, propertyItems, loading, error, updateWeddingItem, updatePropertyItem } = useAppData(accessToken)
  const [activeTab, setActiveTab] = useState('home')

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
          />
        )}
        {activeTab === 'sim' && (
          <SimulationScreen config={config} />
        )}
        {activeTab === 'wedding' && (
          <WeddingScreen
            weddingItems={weddingItems}
            updateWeddingItem={updateWeddingItem}
            loading={loading}
          />
        )}
        {activeTab === 'property' && (
          <PropertyScreen
            config={config}
            propertyItems={propertyItems}
            updatePropertyItem={updatePropertyItem}
            loading={loading}
          />
        )}
      </div>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}
