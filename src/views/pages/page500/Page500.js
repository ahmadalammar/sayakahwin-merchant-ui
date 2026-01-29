import React from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMagnifyingGlass } from '@coreui/icons'

const Page500 = () => {
  return (
    <div className="login-page">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6}>
            <div className="login-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div className="login-header">
                <h1 className="brand-title">sayakahwin ✦</h1>
              </div>
              
              <div className="login-body text-center">
                <h1 style={{ fontSize: '4rem', fontWeight: '700', color: 'var(--sk-danger)', marginBottom: '0.5rem' }}>
                  500
                </h1>
                <h4 style={{ color: 'var(--sk-text-primary)', marginBottom: '0.5rem' }}>
                  Server Error
                </h4>
                <p className="text-muted mb-4">
                  Houston, we have a problem! The server encountered an error. Please try again later.
                </p>
                
                <CInputGroup className="mb-4">
                  <CInputGroupText>
                    <CIcon icon={cilMagnifyingGlass} />
                  </CInputGroupText>
                  <CFormInput type="text" placeholder="Search..." />
                  <CButton color="primary">Search</CButton>
                </CInputGroup>
                
                <CButton color="primary" variant="outline" href="/#/dashboard">
                  Back to Dashboard
                </CButton>
              </div>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Page500
