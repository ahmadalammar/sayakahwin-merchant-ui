import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CBadge,
  CTooltip,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCopy, cilCheckAlt, cilTags, cilLink } from '@coreui/icons'
import authService from '../../services/auth'
import { getCouponStatus } from '../../utils/subscriptionCredits'
import { buildStudioShareUrl } from './CouponLinkModal'

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

const getCouponCode = (c) =>
  c?.coupon_value || c?.couponValue || c?.code || c?.coupon_code || c?.couponCode || ''

const ExperienceBadges = ({ coupon }) => {
  const badges = []
  if (coupon?.coupon_enable_rsvp ?? coupon?.enable_rsvp) {
    badges.push(
      <CBadge key="rsvp" color="info" className="me-1">
        RSVP
      </CBadge>,
    )
  }
  if (coupon?.coupon_enable_bundle_standard ?? coupon?.enable_bundle_standard) {
    badges.push(
      <CBadge key="bundly" color="primary" className="me-1">
        Bundly
      </CBadge>,
    )
  }
  return badges.length > 0 ? badges : <span className="text-muted">—</span>
}

const statusBadge = (status) => {
  if (status === 'redeemed') {
    return <CBadge color="success">Redeemed</CBadge>
  }
  return <CBadge color="warning">Pending</CBadge>
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

const CouponHistoryTable = ({ coupons }) => {
  const [copiedCode, setCopiedCode] = useState(null)
  const user = authService.getCurrentUser()
  const merchantId = user?.merchantId

  const sorted = useMemo(() => {
    return [...(coupons || [])].sort((a, b) => {
      const da = parseApiDate(a.createdAt || a.created_at)?.getTime() ?? 0
      const db = parseApiDate(b.createdAt || b.created_at)?.getTime() ?? 0
      return db - da
    })
  }, [coupons])

  const handleCopyLink = async (code) => {
    const url = buildStudioShareUrl(code)
    if (!url) return
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopiedCode(`link:${code}`)
      setTimeout(() => setCopiedCode(null), 1500)
    }
  }

  if (sorted.length === 0) {
    return (
      <CAlert color="info" className="text-center py-5 mb-0">
        <CIcon icon={cilTags} size="3xl" className="mb-3 text-muted" />
        <h5>No coupons yet</h5>
        <p className="mb-0">Click Generate coupon above to create your first shareable link.</p>
      </CAlert>
    )
  }

  return (
    <div className="table-responsive">
      <CTable hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Code</CTableHeaderCell>
            <CTableHeaderCell>Experience</CTableHeaderCell>
            <CTableHeaderCell>Credit Cost</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Issued</CTableHeaderCell>
            <CTableHeaderCell>Event</CTableHeaderCell>
            <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {sorted.map((coupon, index) => {
            const code = getCouponCode(coupon)
            const status = getCouponStatus(coupon)
            const eventId = coupon.related_event_id ?? coupon.relatedEventId
            const amount = Number(coupon.amount ?? 1)

            return (
              <CTableRow key={coupon.id || code || index}>
                <CTableDataCell data-label="Code">
                  {code ? (
                    <code
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        color: 'var(--sk-purple, #6f42c1)',
                      }}
                    >
                      {code}
                    </code>
                  ) : (
                    <span className="text-muted">N/A</span>
                  )}
                </CTableDataCell>
                <CTableDataCell data-label="Experience">
                  <ExperienceBadges coupon={coupon} />
                </CTableDataCell>
                <CTableDataCell data-label="Credit Cost">
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {amount} credit{amount === 1 ? '' : 's'} on use
                  </span>
                </CTableDataCell>
                <CTableDataCell data-label="Status">{statusBadge(status)}</CTableDataCell>
                <CTableDataCell data-label="Issued">
                  <span className="text-muted">
                    {formatDateTime(coupon.createdAt || coupon.created_at)}
                  </span>
                </CTableDataCell>
                <CTableDataCell data-label="Event">
                  {eventId && merchantId ? (
                    <Link
                      to={`/merchant/${merchantId}/events/${eventId}`}
                      className="text-decoration-none"
                    >
                      View event
                    </Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </CTableDataCell>
                <CTableDataCell data-label="Actions" className="text-end">
                  {code && status === 'pending' ? (
                    <CTooltip content={copiedCode === `link:${code}` ? 'Copied!' : 'Copy Studio link'}>
                      <CButton
                        color={copiedCode === `link:${code}` ? 'success' : 'primary'}
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(code)}
                        className="d-inline-flex align-items-center gap-1"
                      >
                        <CIcon
                          icon={copiedCode === `link:${code}` ? cilCheckAlt : cilLink}
                          size="sm"
                        />
                        {copiedCode === `link:${code}` ? 'Copied' : 'Copy link'}
                      </CButton>
                    </CTooltip>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </CTableDataCell>
              </CTableRow>
            )
          })}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default CouponHistoryTable
