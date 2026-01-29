import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CForm,
  CFormInput,
  CSpinner,
} from '@coreui/react'
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
      <div className="login-page">
        <div className="login-card">
          {/* Header with Logo */}
          <div className="login-header">
            <h1 className="brand-title">sayakahwin ✦</h1>
            <p className="brand-subtitle">Merchant Dashboard</p>
          </div>
          
          {/* Login Form */}
          <div className="login-body">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to manage your wedding cards</p>
            
            {error && (
              <CAlert color="danger">
                {error}
              </CAlert>
            )}
            
            <CForm onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label">Username or Email</label>
                <CFormInput
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Password</label>
                <CFormInput
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              
              <CButton 
                type="submit" 
                color="primary" 
                className="w-100"
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
              <span>or</span>
            </div>
            
            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                size="large"
                theme="outline"
                text="signin_with"
              />
            </div>
            
            <div className="text-center mt-4">
              <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                Don't have an account?{' '}
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
