import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { GoogleLogin } from '@react-oauth/google'
import authService from 'src/services/auth'
import PageTitle from 'src/components/PageTitle'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await authService.login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid username or password. Please try again.')
      console.error('Login failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLoginSuccess = async (response) => {
    setError('')
    setLoading(true)
    
    try {
      await authService.loginWithGoogle(response.credential)
      navigate('/dashboard')
    } catch (err) {
      setError('Google login failed. Please try again.')
      console.error('Google login failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLoginError = () => {
    setError('Google login failed. Please try again.')
    console.error('Google login failed')
  }

  return (
    <>
      <PageTitle 
        title="Login" 
        description="Sign in to your Sayakahwin Merchant Dashboard to manage your wedding cards and events" 
      />
      <div className="login-page" data-coreui-theme="light">
        <div className="login-page__decor" aria-hidden="true">
          <span className="login-page__orb login-page__orb--1" />
          <span className="login-page__orb login-page__orb--2" />
          <span className="login-page__orb login-page__orb--3" />
        </div>

        <div className="login-card">
          <div className="login-brand-panel">
            <div className="login-brand-panel__content">
              <div className="login-brand-panel__badge">Merchant Portal</div>
              <h1 className="brand-title">
                sayakahwin <span className="brand-sparkle">✦</span>
              </h1>
              <p className="brand-tagline">
                Manage wedding cards, events, and invitations — all in one beautiful dashboard.
              </p>
              <ul className="login-brand-panel__features">
                <li>Digital invitation cards</li>
                <li>Event & guest management</li>
                <li>Templates & licensing</li>
              </ul>
            </div>
          </div>

          <div className="login-body">
            <div className="login-body__header">
              <h2 className="login-title">Welcome back</h2>
              <p className="login-subtitle">Sign in to continue to your dashboard</p>
            </div>

            {error && (
              <CAlert color="danger" className="login-alert">
                {error}
              </CAlert>
            )}

            <CForm onSubmit={handleLogin} className="login-form">
              <div className="mb-3">
                <label className="form-label login-form-label">Username or Email</label>
                <CInputGroup className="login-input-group">
                  <CInputGroupText>
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </CInputGroup>
              </div>

              <div className="mb-4">
                <label className="form-label login-form-label">Password</label>
                <CInputGroup className="login-input-group">
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </CInputGroup>
              </div>

              <CButton
                type="submit"
                color="primary"
                className="w-100 login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </CButton>
            </CForm>

            <div className="login-divider">
              <span>or continue with</span>
            </div>

            <div className="login-google-wrap">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                size="large"
                theme="outline"
                text="signin_with"
              />
            </div>

            <div className="login-footer">
              <p>
                Don&apos;t have an account?{' '}
                <a
                  href="https://sayakahwin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
