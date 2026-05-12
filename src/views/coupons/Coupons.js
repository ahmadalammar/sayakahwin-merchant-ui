import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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
  CContainer,
  CFormSelect,
  CFormInput,
  CButton,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTags,
  cilPlus,
  cilSearch,
  cilCopy,
  cilCheckAlt,
  cilWallet,
  cilGift,
  cilCheckCircle,
  cilShareAlt,
  cilExternalLink,
  cilPencil,
} from '@coreui/icons'
import merchantService from '../../services/merchantService'
import authService from '../../services/auth'
import config from 'src/config'
import PageTitle from '../../components/PageTitle'

const parseApiDate = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  const str = String(value).trim()
  if (str.includes('T')) {
    const d = new Date(str)
    return isNaN(d.getTime()) ? null : d
  }
  const iso = str.replace(' ', 'T') + 'Z'
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

const formatDateTime = (value) => {
  const d = parseApiDate(value)
  if (!d) return 'N/A'
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// Determine coupon status:
// - related_event_id present  => redeemed (used)
// - related_event_id null/missing => active
// Falls back to explicit status / used flags / expiry if no related_event_id field at all.
const deriveStatus = (coupon) => {
  if (!coupon) return 'unknown'
  if ('related_event_id' in coupon || 'relatedEventId' in coupon) {
    const eventId = coupon.related_event_id ?? coupon.relatedEventId
    return eventId ? 'used' : 'active'
  }
  if (typeof coupon.status === 'string' && coupon.status) {
    return coupon.status.toLowerCase()
  }
  if (coupon.redeemed_at || coupon.redeemedAt || coupon.used_at || coupon.usedAt) {
    return 'used'
  }
  if (coupon.is_used === true || coupon.used === true) return 'used'
  if (coupon.expires_at || coupon.expiresAt) {
    const exp = parseApiDate(coupon.expires_at || coupon.expiresAt)
    if (exp && exp.getTime() < Date.now()) return 'expired'
  }
  return 'active'
}

const statusBadge = (status) => {
  switch (status) {
    case 'active':
      return <CBadge color="success">Active</CBadge>
    case 'used':
    case 'redeemed':
      return <CBadge color="secondary">Used</CBadge>
    case 'expired':
      return <CBadge color="warning">Expired</CBadge>
    case 'cancelled':
    case 'canceled':
    case 'revoked':
      return <CBadge color="danger">Revoked</CBadge>
    default:
      return <CBadge color="dark">{status || 'Unknown'}</CBadge>
  }
}

const Coupons = () => {
  const navigate = useNavigate()
  const [coupons, setCoupons] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search / filters / pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Generate modal
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)

  // Success modal
  const [generatedCoupon, setGeneratedCoupon] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)

  // Share modal
  const [shareCoupon, setShareCoupon] = useState(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const getCouponCode = (c) =>
    c?.coupon_value || c?.couponValue || c?.code || c?.coupon_code || c?.couponCode || ''

  const buildShareUrl = (code) => {
    if (!code) return ''
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const user = authService.getCurrentUser()
    const merchantId = user?.merchantId
    if (!merchantId) return ''
    return `${origin}/#/merchant/${merchantId}/selfService?coupon=${encodeURIComponent(code)}`
  }

  const handleShareLink = async (coupon) => {
    const code = getCouponCode(coupon)
    if (!code) return
    const url = buildShareUrl(code)
    // Try native share first (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Claim your wedding card coupon',
          text: `Use this private link to create your wedding card on Sayakahwin (coupon: ${code}).`,
          url,
        })
        return
      } catch {
        // user cancelled or share failed — fall back to modal
      }
    }
    setCopiedLink(false)
    setShareCoupon(coupon)
  }

  const handleCopyLink = async () => {
    const code = getCouponCode(shareCoupon)
    const url = buildShareUrl(code)
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 1500)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 1500)
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }

  const loadData = useCallback(async () => {
    const user = authService.getCurrentUser()
    if (!user || !user.merchantId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const sub = await merchantService.getSubscription()
      setSubscription(sub)
      setCoupons(merchantService.extractCouponsFromSubscription(sub))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load coupons.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleViewCard = (eventId) => {
    if (!eventId) return
    const user = authService.getCurrentUser()
    const merchantId = user?.merchantId
    if (!merchantId) return
    const url = `${config.CARD_BASE_URL}/${merchantId}/${eventId}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleEditCard = (eventId) => {
    if (!eventId) return
    const user = authService.getCurrentUser()
    const merchantId = user?.merchantId
    if (!merchantId) return
    navigate(`/merchant/${merchantId}/events/${eventId}`)
  }

  const handleCopy = async (code) => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode((prev) => (prev === code ? null : prev)), 1500)
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopiedCode(code)
        setTimeout(() => setCopiedCode((prev) => (prev === code ? null : prev)), 1500)
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }

  const openGenerateModal = () => {
    setGenerateError(null)
    setShowGenerateModal(true)
  }

  const handleGenerate = async () => {
    const remaining = Number(subscription?.event_credits_remaining ?? 0)
    if (remaining < 1) {
      setGenerateError('You have no credits available to generate a coupon.')
      return
    }

    setGenerating(true)
    setGenerateError(null)
    try {
      const result = await merchantService.createCoupon(1)
      const newCoupon = result?.coupon || result?.data || result
      setShowGenerateModal(false)
      setGeneratedCoupon(newCoupon)
      await loadData()
    } catch (err) {
      setGenerateError(
        err.response?.data?.message || err.message || 'Failed to generate coupon.',
      )
    } finally {
      setGenerating(false)
    }
  }

  // Derived list: sort newest first
  const sortedCoupons = useMemo(() => {
    return [...coupons].sort((a, b) => {
      const da = parseApiDate(a.createdAt || a.created_at)?.getTime() ?? 0
      const db = parseApiDate(b.createdAt || b.created_at)?.getTime() ?? 0
      return db - da
    })
  }, [coupons])

  const enriched = useMemo(
    () =>
      sortedCoupons.map((c) => ({
        ...c,
        _status: deriveStatus(c),
        _code: c.coupon_value || c.couponValue || c.code || c.coupon_code || c.couponCode || '',
        _amount: Number(c.amount ?? c.credits ?? c.value ?? 0),
        _createdAt: c.createdAt || c.created_at,
        _redeemedAt: c.redeemed_at || c.redeemedAt || c.used_at || c.usedAt,
        _relatedEventId: c.related_event_id ?? c.relatedEventId ?? null,
      })),
    [sortedCoupons],
  )

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return enriched.filter((c) => {
      if (statusFilter && c._status !== statusFilter) return false
      if (!term) return true
      return (
        c._code.toLowerCase().includes(term) ||
        String(c._amount).includes(term) ||
        (c.id && String(c.id).toLowerCase().includes(term))
      )
    })
  }, [enriched, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage)

  const stats = useMemo(() => {
    const counts = enriched.reduce(
      (acc, c) => {
        acc.total += 1
        if (c._status === 'active') {
          acc.active += 1
          acc.activeCredits += c._amount
        } else if (c._status === 'used' || c._status === 'redeemed') {
          acc.used += 1
        }
        return acc
      },
      { total: 0, active: 0, used: 0, activeCredits: 0 },
    )
    return counts
  }, [enriched])

  if (loading) {
    return (
      <>
        <PageTitle title="Coupons" description="Generate and manage credit coupons" />
        <div className="loading-container">
          <CSpinner />
          <p>Loading coupons...</p>
        </div>
      </>
    )
  }

  const remainingCredits = Number(subscription?.event_credits_remaining ?? 0)

  return (
    <>
      <PageTitle title="Coupons" description="Generate and manage credit coupons" />
      <CContainer fluid>
        {error && (
          <CAlert color="danger" className="mb-4">
            {error}
          </CAlert>
        )}

        {/* Stats Overview */}
        <CRow className="mb-4">
          <CCol md={4}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilWallet} />
                </div>
                <div className="stat-value">{remainingCredits}</div>
                <div className="stat-label">Credits Available</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilGift} />
                </div>
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">
                  Active Coupons{stats.activeCredits > 0 ? ` · ${stats.activeCredits} credits` : ''}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="h-100">
              <CCardBody className="stat-card">
                <div className="stat-icon">
                  <CIcon icon={cilCheckCircle} />
                </div>
                <div className="stat-value">{stats.used}</div>
                <div className="stat-label">Redeemed Coupons</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Coupons Card */}
        <CCard>
          <CCardHeader>
            <CRow className="align-items-center">
              <CCol>
                <div className="d-flex align-items-center gap-2">
                  <CIcon icon={cilTags} className="text-navy" size="lg" />
                  <div>
                    <strong>Coupons</strong>
                    <p className="text-muted mb-0">
                      Generate coupons from your credits and share them
                    </p>
                  </div>
                </div>
              </CCol>
              <CCol xs="auto">
                <CButton
                  color="primary"
                  onClick={openGenerateModal}
                  className="d-flex align-items-center gap-2"
                  disabled={remainingCredits < 1}
                >
                  <CIcon icon={cilPlus} />
                  Generate Coupon
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            {/* Search & Filter */}
            <CRow className="g-3 mb-4 align-items-center">
              <CCol md={6} lg={5}>
                <div className="position-relative">
                  <CIcon
                    icon={cilSearch}
                    className="position-absolute text-muted"
                    style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <CFormInput
                    type="text"
                    placeholder="Search by coupon code or amount..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </CCol>
              <CCol md={4} lg={3}>
                <CFormSelect
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  aria-label="Filter by status"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="used">Used</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
                </CFormSelect>
              </CCol>
              <CCol md={2} lg="auto" className="ms-md-auto">
                <CBadge className="badge-navy px-3 py-2">
                  {filtered.length} Coupon{filtered.length !== 1 ? 's' : ''}
                </CBadge>
              </CCol>
            </CRow>

            {filtered.length === 0 ? (
              <CAlert color="info" className="text-center py-5 mb-0">
                <CIcon icon={cilTags} size="3xl" className="mb-3 text-muted" />
                <h5>
                  {searchTerm || statusFilter
                    ? 'No coupons match your filters'
                    : 'No coupons yet'}
                </h5>
                <p className="mb-3">
                  {searchTerm || statusFilter
                    ? 'Try adjusting your search or filter.'
                    : 'Generate your first coupon to share credits.'}
                </p>
                {!(searchTerm || statusFilter) && remainingCredits >= 1 && (
                  <CButton
                    color="primary"
                    onClick={openGenerateModal}
                    className="d-flex align-items-center gap-2 mx-auto"
                  >
                    <CIcon icon={cilPlus} />
                    Generate Your First Coupon
                  </CButton>
                )}
              </CAlert>
            ) : (
              <>
                <div className="table-responsive">
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell style={{ width: '60px' }}>#</CTableHeaderCell>
                        <CTableHeaderCell>Coupon Code</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Created</CTableHeaderCell>
                        <CTableHeaderCell>Redeemed</CTableHeaderCell>
                        <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {paginated.map((coupon, index) => (
                        <CTableRow key={coupon.id || coupon._code || index}>
                          <CTableDataCell data-label="#">
                            <span className="text-muted">
                              {(safePage - 1) * itemsPerPage + index + 1}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell data-label="Coupon Code">
                            {coupon._code ? (
                              <code
                                style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 600,
                                  letterSpacing: '0.5px',
                                  color: 'var(--sk-purple, #6f42c1)',
                                }}
                              >
                                {coupon._code}
                              </code>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell data-label="Amount" className="text-end">
                            <strong>
                              {coupon._amount} {coupon._amount === 1 ? 'credit' : 'credits'}
                            </strong>
                          </CTableDataCell>
                          <CTableDataCell data-label="Status">
                            {statusBadge(coupon._status)}
                          </CTableDataCell>
                          <CTableDataCell data-label="Created">
                            <span className="text-muted">{formatDateTime(coupon._createdAt)}</span>
                          </CTableDataCell>
                          <CTableDataCell data-label="Redeemed">
                            {coupon._status === 'used' ? (
                              coupon._redeemedAt ? (
                                <span className="text-muted">
                                  {formatDateTime(coupon._redeemedAt)}
                                </span>
                              ) : coupon._relatedEventId ? (
                                <CTooltip content={`Event ID: ${coupon._relatedEventId}`}>
                                  <span className="text-muted">
                                    Event{' '}
                                    <code style={{ fontSize: '0.8rem' }}>
                                      {String(coupon._relatedEventId).slice(0, 8)}
                                    </code>
                                  </span>
                                </CTooltip>
                              ) : (
                                <span className="text-muted">Redeemed</span>
                              )
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell data-label="Actions" className="text-end">
                            {coupon._code ? (
                              <div className="d-inline-flex gap-2 flex-wrap justify-content-end">
                                <CTooltip
                                  content={
                                    copiedCode === coupon._code ? 'Copied!' : 'Copy code'
                                  }
                                >
                                  <CButton
                                    color={
                                      copiedCode === coupon._code ? 'success' : 'secondary'
                                    }
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(coupon._code)}
                                    className="d-inline-flex align-items-center gap-1"
                                  >
                                    <CIcon
                                      icon={
                                        copiedCode === coupon._code ? cilCheckAlt : cilCopy
                                      }
                                      size="sm"
                                    />
                                    {copiedCode === coupon._code ? 'Copied' : 'Copy'}
                                  </CButton>
                                </CTooltip>
                                {coupon._status === 'active' && (
                                  <CTooltip content="Share self-service link">
                                    <CButton
                                      color="primary"
                                      size="sm"
                                      onClick={() => handleShareLink(coupon)}
                                      className="d-inline-flex align-items-center gap-1"
                                    >
                                      <CIcon icon={cilShareAlt} size="sm" />
                                      Share
                                    </CButton>
                                  </CTooltip>
                                )}
                                {coupon._status === 'used' && coupon._relatedEventId && (
                                  <>
                                    <CTooltip content="Open wedding card">
                                      <CButton
                                        color="info"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewCard(coupon._relatedEventId)}
                                        className="d-inline-flex align-items-center gap-1"
                                      >
                                        <CIcon icon={cilExternalLink} size="sm" />
                                        View
                                      </CButton>
                                    </CTooltip>
                                    <CTooltip content="Edit wedding card">
                                      <CButton
                                        color="warning"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditCard(coupon._relatedEventId)}
                                        className="d-inline-flex align-items-center gap-1"
                                      >
                                        <CIcon icon={cilPencil} size="sm" />
                                        Edit
                                      </CButton>
                                    </CTooltip>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 pt-4 border-top">
                    <CRow className="align-items-center">
                      <CCol>
                        <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                          Showing {(safePage - 1) * itemsPerPage + 1} to{' '}
                          {Math.min(safePage * itemsPerPage, filtered.length)} of {filtered.length}{' '}
                          coupons
                        </p>
                      </CCol>
                      <CCol xs="auto">
                        <CPagination aria-label="Coupons pagination">
                          <CPaginationItem
                            disabled={safePage === 1}
                            onClick={() => setCurrentPage(safePage - 1)}
                          >
                            Previous
                          </CPaginationItem>
                          {[...Array(Math.min(totalPages, 5)).keys()].map((page) => {
                            let pageNum = page + 1
                            if (totalPages > 5) {
                              if (safePage > 3) pageNum = safePage - 2 + page
                              if (safePage > totalPages - 2) pageNum = totalPages - 4 + page
                            }
                            if (pageNum > totalPages) return null
                            return (
                              <CPaginationItem
                                key={pageNum}
                                active={pageNum === safePage}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </CPaginationItem>
                            )
                          })}
                          <CPaginationItem
                            disabled={safePage === totalPages}
                            onClick={() => setCurrentPage(safePage + 1)}
                          >
                            Next
                          </CPaginationItem>
                        </CPagination>
                      </CCol>
                    </CRow>
                  </div>
                )}
              </>
            )}
          </CCardBody>
        </CCard>

        {/* Generate Coupon Modal */}
        <CModal visible={showGenerateModal} onClose={() => setShowGenerateModal(false)} alignment="center">
          <CModalHeader>
            <CModalTitle className="d-flex align-items-center gap-2">
              <CIcon icon={cilTags} className="text-navy" />
              Generate Coupon
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p className="text-muted mb-4">
              Generate a new coupon code worth <strong>1 credit</strong>. The credit will be moved
              from your subscription into the coupon, which you can share or redeem later.
            </p>

            <div className="bg-cream p-3 rounded mb-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilWallet} className="text-navy" />
                <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                  Available credits
                </span>
              </div>
              <strong style={{ fontSize: '1.125rem' }}>{remainingCredits}</strong>
            </div>

            {generateError && (
              <CAlert color="danger" className="mb-0">
                {generateError}
              </CAlert>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => setShowGenerateModal(false)}
              disabled={generating}
            >
              Cancel
            </CButton>
            <CButton
              color="primary"
              onClick={handleGenerate}
              disabled={generating || remainingCredits < 1}
              className="d-flex align-items-center gap-2"
            >
              {generating ? (
                <>
                  <CSpinner size="sm" /> Generating...
                </>
              ) : (
                <>
                  <CIcon icon={cilPlus} /> Generate Coupon
                </>
              )}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Share Coupon Modal */}
        <CModal
          visible={!!shareCoupon}
          onClose={() => setShareCoupon(null)}
          alignment="center"
        >
          <CModalHeader>
            <CModalTitle className="d-flex align-items-center gap-2">
              <CIcon icon={cilShareAlt} className="text-navy" />
              Share Coupon
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p className="text-muted mb-3">
              Send this link to your client. They will be able to create their wedding card with
              this coupon — no login required.
            </p>

            <div className="bg-cream p-3 rounded mb-3 text-center">
              <div
                className="text-muted"
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Coupon Code
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--sk-purple, #6f42c1)',
                  wordBreak: 'break-all',
                  marginTop: 4,
                }}
              >
                {getCouponCode(shareCoupon) || 'N/A'}
              </div>
            </div>

            <div className="mb-2">
              <label
                className="form-label text-muted"
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                Self-Service Link
              </label>
              <div className="d-flex gap-2 align-items-stretch">
                <CFormInput
                  type="text"
                  value={buildShareUrl(getCouponCode(shareCoupon))}
                  readOnly
                  onFocus={(e) => e.target.select()}
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                />
                <CButton
                  color={copiedLink ? 'success' : 'primary'}
                  onClick={handleCopyLink}
                  className="d-inline-flex align-items-center gap-1 flex-shrink-0"
                >
                  <CIcon icon={copiedLink ? cilCheckAlt : cilCopy} size="sm" />
                  {copiedLink ? 'Copied' : 'Copy'}
                </CButton>
              </div>
            </div>
            <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
              Anyone with this link can claim the coupon. Treat it like a password.
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="outline"
              onClick={() => setShareCoupon(null)}
            >
              Close
            </CButton>
            <CButton
              color="primary"
              href={buildShareUrl(getCouponCode(shareCoupon))}
              target="_blank"
              rel="noopener noreferrer"
              className="d-inline-flex align-items-center gap-1"
            >
              <CIcon icon={cilExternalLink} size="sm" />
              Open Link
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Generated Coupon Success Modal */}
        <CModal
          visible={!!generatedCoupon}
          onClose={() => setGeneratedCoupon(null)}
          alignment="center"
        >
          <CModalHeader>
            <CModalTitle className="text-success d-flex align-items-center gap-2">
              <CIcon icon={cilCheckCircle} className="text-success" />
              Coupon Generated
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p className="text-muted mb-3">
              Your coupon is ready. Share this code with whoever should redeem it.
            </p>

            <div className="bg-cream p-4 rounded text-center mb-3">
              <label
                className="form-label text-muted d-block"
                style={{ fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
              >
                Coupon Code
              </label>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  color: 'var(--sk-purple, #6f42c1)',
                  wordBreak: 'break-all',
                }}
              >
                {getCouponCode(generatedCoupon) || 'N/A'}
              </div>
              <div className="text-muted mt-2" style={{ fontSize: '0.875rem' }}>
                Worth{' '}
                <strong>
                  {Number(
                    generatedCoupon?.amount ?? generatedCoupon?.credits ?? generatedCoupon?.value ?? 0,
                  )}
                </strong>{' '}
                credit
                {Number(
                  generatedCoupon?.amount ?? generatedCoupon?.credits ?? generatedCoupon?.value ?? 0,
                ) === 1
                  ? ''
                  : 's'}
              </div>
            </div>

            <div className="d-flex gap-2">
              <CButton
                color="secondary"
                variant="outline"
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleCopy(getCouponCode(generatedCoupon))}
                disabled={!getCouponCode(generatedCoupon)}
              >
                <CIcon
                  icon={
                    copiedCode && copiedCode === getCouponCode(generatedCoupon)
                      ? cilCheckAlt
                      : cilCopy
                  }
                />
                {copiedCode && copiedCode === getCouponCode(generatedCoupon)
                  ? 'Copied!'
                  : 'Copy Code'}
              </CButton>
              <CButton
                color="primary"
                className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                onClick={() => {
                  const code = getCouponCode(generatedCoupon)
                  if (!code) return
                  const target = generatedCoupon
                  setGeneratedCoupon(null)
                  handleShareLink(target)
                }}
                disabled={!getCouponCode(generatedCoupon)}
              >
                <CIcon icon={cilShareAlt} />
                Share Link
              </CButton>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="success" onClick={() => setGeneratedCoupon(null)}>
              Done
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>
    </>
  )
}

export default Coupons
