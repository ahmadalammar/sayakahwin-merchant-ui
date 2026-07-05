import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CAlert,
  CContainer,
  CButton,
  CProgress,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTags,
  cilPlus,
  cilCalendar,
  cilCreditCard,
  cilLockLocked,
  cilInfo,
  cilArrowRight,
} from '@coreui/icons'
import PageTitle from '../../components/PageTitle'
import useSubscription from '../../hooks/useSubscription'
import merchantService from '../../services/merchantService'
import CreditSummaryCards from '../../components/coupon/CreditSummaryCards'
import CouponLinkModal from '../../components/coupon/CouponLinkModal'
import CouponHistoryTable from '../../components/coupon/CouponHistoryTable'

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

const formatDate = (value) => {
  const d = parseApiDate(value)
  if (!d) return '—'
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const mapGenerateError = (err) => {
  const status = err.response?.status
  if (status === 403) {
    return 'Not enough available credits. Some credits may be reserved by pending coupons.'
  }
  if (status === 404) {
    return 'No active subscription.'
  }
  return err.response?.data?.message || err.message || 'Failed to generate coupon.'
}

const Coupons = () => {
  const { subscription, loading, error, refetch, credits, coupons } = useSubscription()
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)
  const [generatedCoupon, setGeneratedCoupon] = useState(null)
  const [showLinkModal, setShowLinkModal] = useState(false)

  if (loading) {
    return (
      <>
        <PageTitle title="Coupons" description="Generate and share Studio coupon links" />
        <div className="loading-container">
          <CSpinner />
          <p>Loading coupons...</p>
        </div>
      </>
    )
  }

  const canIssue = credits.effectiveAvailable >= 1
  const pendingCount = credits.pendingCount
  const redeemedCount = coupons.filter(
    (c) => c.redeemed === true || c.related_event_id,
  ).length
  const creditUsagePct =
    credits.available + credits.reserved > 0
      ? Math.round((credits.reserved / (credits.available + credits.reserved)) * 100)
      : 0

  const handleGenerate = async () => {
    if (!canIssue || generating) return

    setGenerating(true)
    setGenerateError(null)

    try {
      const result = await merchantService.issueCoupon({
        amount: 1,
        enable_rsvp: true,
        enable_bundle_standard: true,
      })
      setGeneratedCoupon(result)
      setShowLinkModal(true)
      await refetch({ silent: true })
    } catch (err) {
      setGenerateError(mapGenerateError(err))
    } finally {
      setGenerating(false)
    }
  }

  const handleCloseLinkModal = () => {
    setShowLinkModal(false)
    setGeneratedCoupon(null)
  }

  return (
    <>
      <PageTitle title="Coupons" description="Generate and share Studio coupon links" />
      <CContainer fluid>
        {error && (
          <CAlert color="danger" className="mb-4">
            {error}
          </CAlert>
        )}

        {generateError && (
          <CAlert color="danger" className="mb-4" dismissible onClose={() => setGenerateError(null)}>
            {generateError}
          </CAlert>
        )}

        <div className="coupons-hero mb-4">
          <CRow className="align-items-center g-4">
            <CCol lg={7}>
              <div className="coupons-hero-badge mb-2">
                <CIcon icon={cilTags} className="me-1" />
                Studio coupons
              </div>
              <h2 className="coupons-hero-title mb-2">Share a link, customer creates their card</h2>
              <p className="coupons-hero-text mb-0">
                Generate a coupon to get a ready-to-send Studio link. Credits are reserved until your
                customer creates their card — nothing is charged at generation time.
              </p>
            </CCol>
            <CCol lg={5}>
              <div className="coupons-hero-action">
                <div className="coupons-hero-action-inner">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                        Credits you can issue
                      </span>
                      <strong>{credits.effectiveAvailable}</strong>
                    </div>
                    <CProgress
                      value={creditUsagePct}
                      color="warning"
                      className="coupons-credit-bar"
                    />
                    <div
                      className="d-flex justify-content-between mt-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <span className="text-muted">{credits.reserved} reserved</span>
                      <span className="text-muted">{credits.available} available</span>
                    </div>
                  </div>
                  <CButton
                    color="light"
                    size="lg"
                    className="w-100 coupons-issue-btn"
                    onClick={handleGenerate}
                    disabled={!canIssue || generating}
                  >
                    {generating ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <CIcon icon={cilPlus} className="me-2" />
                        Generate coupon
                      </>
                    )}
                  </CButton>
                  {!canIssue && subscription && (
                    <p className="coupons-hero-warning mb-0 mt-2">
                      <CIcon icon={cilLockLocked} size="sm" className="me-1" />
                      All credits are in use or reserved by pending coupons
                    </p>
                  )}
                </div>
              </div>
            </CCol>
          </CRow>
        </div>

        {subscription && (
          <CCard className="mb-4 coupons-subscription-strip">
            <CCardBody className="py-3">
              <CRow className="align-items-center g-3">
                <CCol md={4}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="coupons-strip-icon">
                      <CIcon icon={cilCreditCard} />
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Package
                      </div>
                      <strong>{subscription.package_name || 'Subscription'}</strong>
                    </div>
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="coupons-strip-icon">
                      <CIcon icon={cilCalendar} />
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Expires
                      </div>
                      <strong>{formatDate(subscription.end_date)}</strong>
                    </div>
                  </div>
                </CCol>
                <CCol md={4} className="text-md-end">
                  <Link to="/license" className="coupons-view-license">
                    View full subscription
                    <CIcon icon={cilArrowRight} size="sm" className="ms-1" />
                  </Link>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        )}

        <CreditSummaryCards credits={credits} />

        <CCard className="mb-4 coupons-how-it-works">
          <CCardBody className="py-3">
            <div className="d-flex align-items-start gap-2">
              <CIcon icon={cilInfo} className="text-navy mt-1 flex-shrink-0" />
              <div>
                <strong>How it works</strong>
                <ol className="coupons-steps mb-0 mt-2">
                  <li>Click Generate coupon — your Studio link appears instantly</li>
                  <li>Copy and send the link to your customer</li>
                  <li>Customer creates their card in Studio — 1 credit is then used</li>
                </ol>
              </div>
            </div>
          </CCardBody>
        </CCard>

        <CCard>
          <CCardHeader className="coupons-history-header">
            <strong>Coupon history</strong>
            <p className="text-muted mb-0">
              {pendingCount} pending · {redeemedCount} redeemed
            </p>
          </CCardHeader>
          <CCardBody>
            <CouponHistoryTable coupons={coupons} />
          </CCardBody>
        </CCard>

        <CouponLinkModal
          visible={showLinkModal}
          coupon={generatedCoupon}
          onClose={handleCloseLinkModal}
        />
      </CContainer>
    </>
  )
}

export default Coupons
