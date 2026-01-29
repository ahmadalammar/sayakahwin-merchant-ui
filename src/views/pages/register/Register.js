import React from 'react'
import {
  CButton,
  CForm,
  CFormInput,
} from '@coreui/react'

const Register = () => {
  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '450px' }}>
        {/* Header with Logo */}
        <div className="login-header">
          <h1 className="brand-title">sayakahwin ✦</h1>
          <p className="brand-subtitle">Merchant Dashboard</p>
        </div>
        
        {/* Register Form */}
        <div className="login-body">
          <h2 className="login-title">Create Account</h2>
          <p className="login-subtitle">Register as a new merchant</p>
          
          <CForm>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <CFormInput
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <CFormInput
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Password</label>
              <CFormInput
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <CFormInput
                type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>
            
            <CButton type="submit" color="primary" className="w-100">
              Create Account
            </CButton>
            
            <div className="text-center mt-4">
              <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                Already have an account?{' '}
                <a href="/#/login">Sign in</a>
              </p>
            </div>
          </CForm>
        </div>
      </div>
    </div>
  )
}

export default Register
