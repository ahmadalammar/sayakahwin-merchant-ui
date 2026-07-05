import React from 'react'
import { CCard, CCardBody, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWallet, cilLockLocked, cilTags } from '@coreui/icons'

const CreditSummaryCards = ({ credits }) => {
  const { available, reserved, pendingCount } = credits

  return (
    <CRow className="mb-4">
      <CCol md={4}>
        <CCard className="h-100">
          <CCardBody className="stat-card">
            <div className="stat-icon">
              <CIcon icon={cilWallet} />
            </div>
            <div className="stat-value">{available}</div>
            <div className="stat-label">Available Credits</div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={4}>
        <CCard className="h-100">
          <CCardBody className="stat-card">
            <div className="stat-icon">
              <CIcon icon={cilLockLocked} />
            </div>
            <div className="stat-value">{reserved}</div>
            <div className="stat-label">Reserved (Pending Coupons)</div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={4}>
        <CCard className="h-100">
          <CCardBody className="stat-card">
            <div className="stat-icon">
              <CIcon icon={cilTags} />
            </div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Coupons</div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreditSummaryCards
