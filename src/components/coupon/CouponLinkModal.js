import React, { useEffect, useRef } from 'react'
import {
  CModal,
  CModalBody,
  CModalFooter,
  CButton,
  CAlert,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilCopy, cilCheckAlt, cilLink } from '@coreui/icons'
import config from 'src/config'

export const buildStudioShareUrl = (code) => {
  if (!code) return ''
  return `${config.CARD_BASE_URL}/studio?coupon=${encodeURIComponent(code)}`
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
  return badges.length > 0 ? badges : null
}

/** Shows the shareable Studio link after a coupon is generated. */
const CouponLinkModal = ({ visible, coupon, onClose }) => {
  const linkInputRef = useRef(null)
  const [copiedLink, setCopiedLink] = React.useState(false)

  const code = coupon?.coupon_value || coupon?.couponValue || coupon?.code || ''
  const studioUrl = buildStudioShareUrl(code)

  useEffect(() => {
    if (!visible || !studioUrl) return

    copyToClipboard(studioUrl).then((ok) => {
      if (ok) {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 3000)
      }
    })

    const timer = setTimeout(() => {
      linkInputRef.current?.focus()
      linkInputRef.current?.select()
    }, 150)
    return () => clearTimeout(timer)
  }, [visible, studioUrl])

  const handleClose = () => {
    setCopiedLink(false)
    onClose()
  }

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(studioUrl)
    if (ok) {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  if (!visible || !studioUrl) return null

  return (
    <CModal
      visible={visible}
      onClose={handleClose}
      alignment="center"
      size="lg"
      className="coupon-success-modal"
    >
      <CModalBody className="coupon-success-body p-0">
        <div className="coupon-success-header">
          <div className="coupon-success-icon">
            <CIcon icon={cilCheckCircle} size="xl" />
          </div>
          <h4 className="mb-1">Your shareable link is ready</h4>
          <p className="text-muted mb-0">
            Copy and send this to your customer. <CBadge color="warning">Pending</CBadge>
          </p>
        </div>

        <div className="coupon-success-content">
          {copiedLink && (
            <CAlert color="success" className="coupon-copied-banner mb-3">
              <CIcon icon={cilCheckAlt} className="me-2" />
              Link copied — paste and send to your customer
            </CAlert>
          )}

          <label className="coupon-link-label">
            <CIcon icon={cilLink} className="me-1" />
            Studio link
          </label>
          <div className="coupon-link-box">
            <textarea
              ref={linkInputRef}
              className="coupon-link-input"
              readOnly
              rows={3}
              value={studioUrl}
              onClick={(e) => e.target.select()}
            />
            <CButton
              color={copiedLink ? 'success' : 'primary'}
              className="coupon-link-copy-btn"
              onClick={handleCopyLink}
            >
              <CIcon icon={copiedLink ? cilCheckAlt : cilCopy} className="me-2" />
              {copiedLink ? 'Copied!' : 'Copy link'}
            </CButton>
          </div>

          {code && (
            <div className="coupon-code-strip">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="coupon-code-label mb-0">Code</span>
                <code className="coupon-code-value">{code}</code>
                <ExperienceBadges coupon={coupon} />
              </div>
            </div>
          )}
        </div>
      </CModalBody>
      <CModalFooter className="coupon-success-footer">
        <CButton color="primary" onClick={handleClose} className="px-4">
          Done
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default CouponLinkModal
