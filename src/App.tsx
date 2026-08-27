import { useEffect, useState } from 'react'
import { AuthPage } from './pages/AuthPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { ProductsPage } from './pages/ProductsPage'
import { AuthProvider } from './auth/AuthContext'
import { useAuth } from './auth/useAuth'
import { AnalysisSection } from './components/AnalysisSection'
import { FeaturedProducts } from './components/FeaturedProducts'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import './App.css'

function App() {
  return <AuthProvider><AppContent /></AuthProvider>
}

function AppContent() {
  const [searchSubmitted, setSearchSubmitted] = useState(false)
  const [path, setPath] = useState(window.location.hash || '#top')
  const { session, loading, signOut } = useAuth()

  useEffect(() => {
    const updatePath = () => setPath(window.location.hash || '#top')
    window.addEventListener('hashchange', updatePath)
    return () => window.removeEventListener('hashchange', updatePath)
  }, [])

  const navigate = (nextPath: string) => { window.location.hash = nextPath }
  const logout = async () => { await signOut(); navigate('#top') }

  const handleSearch = (term: string) => {
    setSearchSubmitted(Boolean(term.trim()))
  }

  if (loading) return <div className="app-loading">Loading your CloudReview account...</div>
  const protectedRoute = path === '#profile' || path === '#favorites'
  if (protectedRoute && !session) return <ProtectedRedirect onNavigate={navigate} />
  if (path === '#login' || path === '#register') return <div className="app-shell"><Header authenticated={Boolean(session)} onNavigate={navigate} onLogout={logout} /><AuthPage key={path} mode={path === '#login' ? 'login' : 'register'} onNavigate={navigate} /></div>
  if (path === '#profile') return <div className="app-shell"><Header authenticated onNavigate={navigate} onLogout={logout} /><ProfilePage onNavigate={navigate} /></div>
  if (path === '#favorites') return <div className="app-shell"><Header authenticated onNavigate={navigate} onLogout={logout} /><FavoritesPage onNavigate={navigate} /></div>
  if (path === '#products') return <div className="app-shell"><Header authenticated={Boolean(session)} onNavigate={navigate} onLogout={logout} /><ProductsPage /></div>
  if (path.startsWith('#product/')) return <div className="app-shell"><Header authenticated={Boolean(session)} onNavigate={navigate} onLogout={logout} /><ProductDetailsPage id={path.slice('#product/'.length)} onNavigate={navigate} /></div>
  return (
    <div className="app-shell">
      <Header authenticated={Boolean(session)} onNavigate={navigate} onLogout={logout} />
      <main>
        <Hero onSearch={handleSearch} searchSubmitted={searchSubmitted} />
        <FeaturedProducts />
        <AnalysisSection />
        <section className="about-section" id="about">
          <p className="section-kicker">About CloudReview AI</p>
          <p>Independent opinions, made easier through thoughtful AI analysis.</p>
        </section>
      </main>
      <footer className="site-footer"><span>CloudReview AI</span><span>Independent opinions, made easier.</span></footer>
    </div>
  )
}

function ProtectedRedirect({ onNavigate }: { onNavigate: (path: string) => void }) {
  useEffect(() => { onNavigate('#login') }, [onNavigate])
  return <div className="app-loading">Redirecting to login...</div>
}

export default App
