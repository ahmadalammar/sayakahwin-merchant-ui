import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CAlert,
  CBadge,
  CProgress,
  CContainer,
  CFormSelect,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCreditCard, cilCalendar, cilHistory } from '@coreui/icons'
import merchantService from '../../services/merchantService'
import authService from '../../services/auth'
import PageTitle from '../../components/PageTitle'

const License = () => {
  const [licenseData, setLicenseData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    const fetchData = async () => {
      // Check if user is authenticated before making API call
      const user = authService.getCurrentUser()
      if (!user || !user.merchantId) {
        setLoading(false)
        return
      }
      
      try {
        const [license, trans] = await Promise.all([
          merchantService.getLicense(),
          merchantService.getTransactionHistory(),
        ])
        if (license) {
          setLicenseData(license)
        }
        if (trans) {
          setTransactions(trans.data || trans)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <>
        <PageTitle title="License" description="View your subscription and transaction history" />
        <div className="loading-container">
          <CSpinner />
          <p>Loading license data...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle title="License" description="View your subscription and transaction history" />
        <CContainer fluid>
          <CAlert color="danger">
            <strong>Error:</strong> {error}
          </CAlert>
        </CContainer>
      </>
    )
  }

  if (!licenseData) {
    return (
      <>
        <PageTitle title="License" description="View your subscription and transaction history" />
        <CContainer fluid>
          <CAlert color="info">No license data available.</CAlert>
        </CContainer>
      </>
    )
  }

  const creditUsage =
    ((licenseData.total_credits - licenseData.event_credits_remaining) / licenseData.total_credits) * 100
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(licenseData.end_date) - new Date()) / (1000 * 60 * 60 * 24))
  )
  
  // Filter transactions
  const filteredTransactions = statusFilter
    ? transactions.filter((t) => t.status.toLowerCase() === statusFilter.toLowerCase())
    : transactions
    
  // Paginate transactions
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CBadge color="success">{status}</CBadge>
      case 'pending':
        return <CBadge color="warning">{status}</CBadge>
      case 'failed':
        return <CBadge color="danger">{status}</CBadge>
      default:
        return <CBadge color="secondary">{status}</CBadge>
    }
  }

  return (
    <>
      <PageTitle title="License" description="View your subscription and transaction history" />
      <CContainer fluid>
        {/* Stats Overview */}
        <CRow className="mb-4">
          <CCol md={4}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilCreditCard} />
                </div>
                <div className="stat-value">{licenseData.event_credits_remaining}</div>
                <div className="stat-label">Credits Remaining</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilCalendar} />
                </div>
                <div className="stat-value">{daysRemaining}</div>
                <div className="stat-label">Days Remaining</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilHistory} />
                </div>
                <div className="stat-value">{transactions.length}</div>
                <div className="stat-label">Total Transactions</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* License Details */}
        <CRow className="mb-4">
          <CCol xs={12}>
            <CCard className="card-primary">
              <CCardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Subscription Details</strong>
                    <p className="text-muted mb-0">Your current package information</p>
                  </div>
                  <CBadge className="badge-navy px-3 py-2">{licenseData.package_name}</CBadge>
                </div>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={6}>
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex justify-content-between pb-2 border-bottom">
                        <span className="text-muted">Package Name</span>
                        <strong>{licenseData.package_name}</strong>
                      </div>
                      <div className="d-flex justify-content-between pb-2 border-bottom">
                        <span className="text-muted">Start Date</span>
                        <strong>{new Date(licenseData.start_date).toLocaleDateString()}</strong>
                      </div>
                      <div className="d-flex justify-content-between pb-2 border-bottom">
                        <span className="text-muted">End Date</span>
                        <strong>{new Date(licenseData.end_date).toLocaleDateString()}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Total Credits</span>
                        <strong>{licenseData.total_credits}</strong>
                      </div>
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mt-3 mt-md-0">
                      <h6 className="text-muted mb-3">Credit Usage</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Used</span>
                        <strong>{licenseData.total_credits - licenseData.event_credits_remaining}</strong>
                      </div>
                      <CProgress value={creditUsage} className="mb-3" />
                      <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.875rem' }}>
                        <span>{creditUsage.toFixed(0)}% used</span>
                        <span>{licenseData.event_credits_remaining} remaining</span>
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Transaction History */}
        <CCard>
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <strong>Transaction History</strong>
                <p className="text-muted mb-0">Your payment and credit history</p>
              </div>
              <CFormSelect
                size="sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </CFormSelect>
            </div>
          </CCardHeader>
          <CCardBody>
            {paginatedTransactions.length > 0 ? (
              <>
                <div className="table-responsive">
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Date</CTableHeaderCell>
                        <CTableHeaderCell>Description</CTableHeaderCell>
                        <CTableHeaderCell>Amount</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {paginatedTransactions.map((transaction) => (
                        <CTableRow key={transaction.id}>
                          <CTableDataCell data-label="Date">
                            {new Date(transaction.date).toLocaleDateString()}
                          </CTableDataCell>
                          <CTableDataCell data-label="Description">
                            {transaction.description}
                          </CTableDataCell>
                          <CTableDataCell data-label="Amount">
                            <strong>RM {transaction.amount.toFixed(2)}</strong>
                          </CTableDataCell>
                          <CTableDataCell data-label="Status">
                            {getStatusBadge(transaction.status)}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
                
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3 pt-3 border-top">
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
                      {filteredTransactions.length}
                    </span>
                    <CPagination aria-label="Transaction pagination">
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </CPaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <CPaginationItem
                          key={i + 1}
                          active={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                )}
              </>
            ) : (
              <CAlert color="info" className="mb-0">
                No transactions found.
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default License
