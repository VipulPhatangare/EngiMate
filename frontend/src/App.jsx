import { useState, useEffect } from 'react'
import './App.css'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import ForgotPassword from './components/ForgotPassword'
import Dashboard from './components/Dashboard'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import { API_URL } from './utils/api'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // Listen for route changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Check for admin route and token
  useEffect(() => {
    if (currentPath === '/admin') {
      const adminToken = localStorage.getItem('adminToken')
      if (adminToken) {
        // Verify admin token (simplified - you can add more validation)
        setIsAdmin(true)
        setAdmin({ email: 'vipulphatangare3@gmail.com', role: 'admin' })
      }
    } else {
      // Regular user authentication check
      const token = localStorage.getItem('token')
      if (token) {
        fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              setIsAuthenticated(true)
              setUser(data.user)
            } else {
              localStorage.removeItem('token')
            }
          })
          .catch(() => {
            localStorage.removeItem('token')
          })
      }
    }
  }, [currentPath])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
  }

  const handleAdminLogin = (adminData) => {
    setIsAdmin(true)
    setAdmin(adminData)
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAdmin(false)
    setAdmin(null)
    window.history.pushState({}, '', '/')
    setCurrentPath('/')
  }

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser)
  }

  // Admin Route
  if (currentPath === '/admin') {
    if (isAdmin) {
      return <AdminDashboard admin={admin} onLogout={handleAdminLogout} />
    } else {
      return <AdminLogin onAdminLogin={handleAdminLogin} />
    }
  }

  return (
    <div className="app">
      {isAuthenticated ? (
        // Show Dashboard when authenticated
        <Dashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      ) : (
        // Show Landing Page when not authenticated
        <>
          {/* Navigation */}
          <nav className="navbar">
            <div className="nav-container">
              <div className="logo">
                <span className="logo-text">Engimate</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="nav-links desktop-nav">
                <button onClick={() => setShowSignIn(true)} className="btn-nav">Sign In</button>
                <button onClick={() => setShowSignUp(true)} className="btn-nav btn-nav-primary">Sign Up</button>
              </div>

              {/* Mobile Menu Button */}
              <button className="hamburger" onClick={toggleSidebar}>
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </nav>

          {/* Mobile Sidebar */}
          <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <button className="close-btn" onClick={closeSidebar}>&times;</button>
            <div className="sidebar-content">
              <button onClick={() => { setShowSignIn(true); closeSidebar(); }} className="btn-sidebar">Sign In</button>
              <button onClick={() => { setShowSignUp(true); closeSidebar(); }} className="btn-sidebar btn-sidebar-primary">Sign Up</button>
            </div>
          </div>

          {/* Overlay */}
          {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}

          {/* Hero Section */}
          <section className="hero">
            <div className="hero-content">
              <h1 className="hero-title">Welcome to Engimate</h1>
              <p className="hero-subtitle">Your Complete MHT CET Engineering Counselling Platform</p>
              <p className="hero-description">
                Navigate your engineering admission journey with confidence. Get personalized guidance, 
                college predictions, and expert counselling support for MHT CET.
              </p>
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={() => setShowSignUp(true)}>Get Started</button>
                <button className="btn btn-secondary">Learn More</button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features" id="features">
            <h2 className="section-title">Why Choose Engimate?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>College Predictor</h3>
                <p>Get accurate college predictions based on your MHT CET rank and preferences</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Cut-off Analysis</h3>
                <p>Access detailed cut-off trends and analysis for all engineering colleges</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3>Expert Guidance</h3>
                <p>Receive personalized counselling from experienced education consultants</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Document Help</h3>
                <p>Step-by-step guidance for document verification and admission process</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer">
            <div className="footer-content">
              <p>&copy; 2025 Engimate. All rights reserved.</p>
              <p>Your trusted partner in engineering admissions</p>
            </div>
          </footer>
        </>
      )}

      {/* Auth Modals */}
      {showSignIn && (
        <SignIn
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false)
            setShowSignUp(true)
          }}
          onSwitchToForgotPassword={() => {
            setShowSignIn(false)
            setShowForgotPassword(true)
          }}
          onLoginSuccess={(userData) => {
            setIsAuthenticated(true)
            setUser(userData)
          }}
        />
      )}

      {showSignUp && (
        <SignUp
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={() => {
            setShowSignUp(false)
            setShowSignIn(true)
          }}
          onSignUpSuccess={(userData) => {
            setIsAuthenticated(true)
            setUser(userData)
          }}
        />
      )}

      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
          onSwitchToSignIn={() => {
            setShowForgotPassword(false)
            setShowSignIn(true)
          }}
          onResetSuccess={() => {
            setShowForgotPassword(false)
            setShowSignIn(true)
          }}
        />
      )}
    </div>
  )
}

export default App

