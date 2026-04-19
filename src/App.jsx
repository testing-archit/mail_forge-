import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import SecuritySection from './components/SecuritySection'
import CtaSection from './components/CtaSection'
import Footer from './components/Footer'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import EmailClient from './pages/EmailClient'
import Settings from './pages/Settings'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  // Generate or retrieve device ID for SSE
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  }

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  // SSE Subscription setup
  useEffect(() => {
    let abortController = null;

    const setupSSE = async () => {
      if (!isAuthenticated) return;

      const token = localStorage.getItem('token')
      const deviceId = getDeviceId()
      
      if (!token) return;

      abortController = new AbortController();

      try {
        const response = await fetch(`http://localhost:8080/app/v1/sse/subscribe/${deviceId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: abortController.signal
        });

        if (!response.ok) {
          console.error("SSE connection failed", response.status);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                console.log('SSE Event received:', data);
                // We can add event dispatching here later, e.g., triggering a refresh
                if (data.type === 'mail_received') {
                   // Optional: show a toast or dispatch a custom event
                   window.dispatchEvent(new CustomEvent('mailforge:new_mail', { detail: data }));
                }
              } catch (err) {
                console.error('Error parsing SSE data:', err, line);
              }
            }
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('SSE connection aborted cleanly.');
        } else {
          console.error('SSE Error:', error);
        }
      }
    };

    setupSSE();

    return () => {
      if (abortController) {
        abortController.abort();
      }
    }
  }, [isAuthenticated]);

  const handleNavigate = (page) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  const handleLogin = (loginData) => {
    console.log('handleLogin called with:', loginData)

    if (loginData.token && loginData.user) {
      localStorage.setItem('token', loginData.token)
      
      // Ensure we have an ID for the user
      const userData = {
        id: loginData.user.id || loginData.user.username,
        username: loginData.user.username || loginData.username,
        email: loginData.user.email,
        externalMail: loginData.user.externalMail,
        firstName: loginData.user.firstName,
        lastName: loginData.user.lastName
      }
      localStorage.setItem('user', JSON.stringify(userData))

      setIsAuthenticated(true)
      setUser(userData)
      setCurrentPage('dashboard')
    } else {
      console.error('Invalid login data - missing token or user:', loginData)
      throw new Error('Login failed: missing token or user data')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setCurrentPage('home')
  }

  // Landing Page
  if (currentPage === 'home' && !isAuthenticated) {
    return (
      <div className="bg-navy">
        <Navbar onNavigate={handleNavigate} />
        <Hero onGetStarted={() => handleNavigate('auth')} />
        <StatsBar />
        <Features />
        <HowItWorks />
        <SecuritySection />
        <CtaSection onGetStarted={() => handleNavigate('auth')} />
        <Footer />
      </div>
    )
  }

  // Auth Page
  if (currentPage === 'auth' && !isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onNavigate={handleNavigate} />
  }

  // Dashboard
  if (currentPage === 'dashboard' && isAuthenticated) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    )
  }

  // Email Client
  if (currentPage === 'email' && isAuthenticated) {
    return <EmailClient user={user} onNavigate={handleNavigate} />
  }

  // Settings
  if (currentPage === 'settings' && isAuthenticated) {
    return (
      <Settings
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    )
  }

  // Default to dashboard if authenticated
  if (isAuthenticated) {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />
    )
  }

  return (
    <div className="bg-navy">
      <Navbar onNavigate={handleNavigate} />
      <Hero onGetStarted={() => handleNavigate('auth')} />
      <StatsBar />
      <Features />
      <HowItWorks />
      <SecuritySection />
      <CtaSection onGetStarted={() => handleNavigate('auth')} />
      <Footer />
    </div>
  )
}
