import React, { useState, useEffect, useMemo } from 'react'
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

// Parse "YYYY-MM-DD HH:mm:ss" (treated as UTC) into a Date safely across browsers
const parseApiDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  const str = String(value).trim()
  // Already ISO-ish (has T)
  if (str.includes('T')) {
    const d = new Date(str)
    return isNaN(d.getTime()) ? null : d
  }
  // Convert "YYYY-MM-DD HH:mm:ss" to ISO UTC
  const iso = str.replace(' ', 'T') + 'Z'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

const formatDate = (value) => {
  const d = parseApiDate(value)
  if (!d) return '—'
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatDateTime = (value) => {
  const d = parseApiDate(value)
  if (!d) return '—'
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const formatTransactionType = (type) => {
  if (!type) return 'Unknown'
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

const License = () => {
  const [licenseData, setLicenseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters and pagination
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      const user = authService.getCurrentUser()
      if (!user || !user.merchantId) {
        setLoading(false)
        return
      }

      try {
        const license = await merchantService.getLicense()
        if (license) {
          setLicenseData(license)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const transactions = useMemo(() => {
    if (!licenseData || !Array.isArray(licenseData.history)) return []
    return [...licenseData.history].sort((a, b) => {
      const da = parseApiDate(a.createdAt)?.getTime() ?? 0
      const db = parseApiDate(b.createdAt)?.getTime() ?? 0
      return db - da
    })
  }, [licenseData])

  const { totalCredits, usedCredits, creditUsagePct } = useMemo(() => {
    const remaining = Number(licenseData?.event_credits_remaining ?? 0)
    // "Used" = anything that draws down credits (event deductions + coupons issued)
    const outflowTypes = new Set(['deduction', 'coupon'])
    const used = transactions
      .filter((t) => outflowTypes.has(t.transaction_type))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const total = used + remaining
    const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0
    return { totalCredits: total, usedCredits: used, creditUsagePct: pct }
  }, [licenseData, transactions])

  const daysRemaining = useMemo(() => {
    const end = parseApiDate(licenseData?.end_date)
    if (!end) return 0
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  }, [licenseData])

  const filteredTransactions = useMemo(() => {
    if (!typeFilter) return transactions
    return transactions.filter((t) => t.transaction_type === typeFilter)
  }, [transactions, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedTransactions = filteredTransactions.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  )

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

  const getTypeBadge = (type) => {
    const label = formatTransactionType(type)
    switch (type) {
      case 'initial':
        return <CBadge color="info">{label}</CBadge>
      case 'refill':
      case 'top_up':
      case 'topup':
      case 'addon':
        return <CBadge color="success">{label}</CBadge>
      case 'deduction':
        return <CBadge color="warning">{label}</CBadge>
      case 'refund':
        return <CBadge color="primary">{label}</CBadge>
      case 'coupon':
        return <CBadge color="dark">{label}</CBadge>
      default:
        return <CBadge color="secondary">{label}</CBadge>
    }
  }

  const renderAmount = (transaction) => {
    const amount = Number(transaction.amount || 0)
    const isOutflow =
      transaction.transaction_type === 'deduction' || transaction.transaction_type === 'coupon'
    if (isOutflow) {
      return (
        <strong style={{ color: 'var(--sk-danger, #dc3545)' }}>
          −{amount} {amount === 1 ? 'credit' : 'credits'}
        </strong>
      )
    }
    return (
      <strong style={{ color: 'var(--sk-success, #198754)' }}>
        +{amount} {amount === 1 ? 'credit' : 'credits'}
      </strong>
    )
  }

  const renderDescription = (transaction) => {
    switch (transaction.transaction_type) {
      case 'initial':
        return 'Initial credit allocation'
      case 'addon':
        return 'Add-on credits'
      case 'refill':
      case 'top_up':
      case 'topup':
        return 'Credit top-up'
      case 'refund':
        return 'Credit refund'
      case 'deduction':
        return transaction.related_event_id ? 'Event creation' : 'Credit deduction'
      case 'coupon':
        return transaction.coupon_value ? (
          <span>
            Coupon generated:{' '}
            <code
              style={{
                fontWeight: 600,
                color: 'var(--sk-purple, #6f42c1)',
              }}
            >
              {transaction.coupon_value}
            </code>
          </span>
        ) : (
          'Coupon generated'
        )
      default:
        return formatTransactionType(transaction.transaction_type)
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
                        <strong>{formatDate(licenseData.start_date)}</strong>
                      </div>
                      <div className="d-flex justify-content-between pb-2 border-bottom">
                        <span className="text-muted">End Date</span>
                        <strong>{formatDate(licenseData.end_date)}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Total Credits</span>
                        <strong>{totalCredits}</strong>
                      </div>
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <div className="mt-3 mt-md-0">
                      <h6 className="text-muted mb-3">Credit Usage</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Used</span>
                        <strong>{usedCredits}</strong>
                      </div>
                      <CProgress value={creditUsagePct} className="mb-3" />
                      <div
                        className="d-flex justify-content-between text-muted"
                        style={{ fontSize: '0.875rem' }}
                      >
                        <span>{creditUsagePct.toFixed(0)}% used</span>
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
                <p className="text-muted mb-0">Your credit transaction history</p>
              </div>
              <CFormSelect
                size="sm"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{ width: 'auto', minWidth: '160px' }}
              >
                <option value="">All Transactions</option>
                <option value="initial">Initial</option>
                <option value="addon">Add-on</option>
                <option value="deduction">Deduction</option>
                <option value="coupon">Coupon</option>
                <option value="refill">Refill</option>
                <option value="refund">Refund</option>
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
                        <CTableHeaderCell>Type</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {paginatedTransactions.map((transaction) => (
                        <CTableRow key={transaction.id}>
                          <CTableDataCell data-label="Date">
                            {formatDateTime(transaction.createdAt)}
                          </CTableDataCell>
                          <CTableDataCell data-label="Description">
                            {renderDescription(transaction)}
                          </CTableDataCell>
                          <CTableDataCell data-label="Type">
                            {getTypeBadge(transaction.transaction_type)}
                          </CTableDataCell>
                          <CTableDataCell data-label="Amount" className="text-end">
                            {renderAmount(transaction)}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3 pt-3 border-top">
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                      Showing {(safePage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(safePage * itemsPerPage, filteredTransactions.length)} of{' '}
                      {filteredTransactions.length}
                    </span>
                    <CPagination aria-label="Transaction pagination">
                      <CPaginationItem
                        disabled={safePage === 1}
                        onClick={() => setCurrentPage(safePage - 1)}
                      >
                        Previous
                      </CPaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <CPaginationItem
                          key={i + 1}
                          active={safePage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={safePage === totalPages}
                        onClick={() => setCurrentPage(safePage + 1)}
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
