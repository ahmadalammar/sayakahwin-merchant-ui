import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { GoogleLogin } from '@react-oauth/google'
import authService from 'src/services/auth'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await authService.login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid username or password')
      console.error('Login failed:', err)
    }
  }

  const handleGoogleLoginSuccess = async (response) => {
    setError('')
    try {
      await authService.loginWithGoogle(response.credential)
      navigate('/dashboard')
    } catch (err) {
      setError('Google login failed. Please try again.')
      console.error('Google login failed:', err)
    }
  }

  const handleGoogleLoginError = () => {
    console.error('Google login failed')
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5}>
            <CCardGroup>
              <CCard className="p-4 shadow-sm">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <div className="text-center mb-4">
                      <h1>Login</h1>
                      <p className="text-body-secondary">Sign In to your account</p>
                    </div>
                    {error && <CAlert color="danger">{error}</CAlert>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={12}>
                        <CButton type="submit" color="primary" className="px-4 w-100">
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol className="text-center">
                        <GoogleLogin
                          onSuccess={handleGoogleLoginSuccess}
                          onError={handleGoogleLoginError}
                        />
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
