import React, { useEffect, useMemo, useState } from 'react'
import {
  CModal,
  CModalBody,
  CModalFooter,
  CButton,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCheckAlt,
  cilCopy,
  cilEnvelopeClosed,
  cilExternalLink,
  cilHeart,
  cilPhone,
  cilStar,
} from '@coreui/icons'
import authService from 'src/services/auth'
import config from 'src/config'

const PREFERENCE_META = [
  { key: 'rsvp', label: 'RSVP' },
  { key: 'experience_bundle', label: 'Experience Bundle' },
  { key: 'whatsapp_reminder', label: 'WhatsApp Reminder' },
  { key: 'qr_checkin', label: 'QR Check-in' },
  { key: 'seat_arrangement', label: 'Seat Arrangement' },
]

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
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

const parsePreferences = (raw) => {
  if (!raw) return {}
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  return {}
}

export const buildWelcomeEmail = (brideShortName, groomShortName) => {
  const bride = (brideShortName || '').trim() || 'Bride'
  const groom = (groomShortName || '').trim() || 'Groom'

  return `Hi ${bride} & ${groom} ☺️,

Thank you for joining Sayakahwin.

We're honored to be a small part of your wedding journey. Planning a celebration is filled with meaningful moments, and we've built Sayakahwin to help you share them beautifully with the people who matter most.

With your account, you can:
• Create a personalized digital wedding invitation
• Share your invitation with family and friends effortlessly
• Manage guest responses in one place
• Customize your invitation to reflect your unique story

Your account is ready, and you can begin creating your invitation anytime.
To access your dashboard, simply sign in using the same Google account you used during registration:
https://user.sayakahwin.com/dashboard

If you have any questions or need assistance, simply reply to this email. We're always happy to help.
Wishing you a joyful and memorable wedding planning experience.

Warm regards,
The Sayakahwin Team
contact@sayakahwin.com
Beautiful invitations for beautiful celebrations.`
}

const WHATSAPP_FOLLOW_UP_MESSAGE = `Hi! Thank you for choosing Sayakahwin. 💕

We noticed that you've created your invitation card in our Studio. ✨

If you'd like to enhance your invitation, we also offer features such as Smart RSVP, Music, Photo Gallery, Digital Angpow, Gift Wishlist, QR Registration & Check-in, Seat Arrangement, and Guest Reminder Service.

Feel free to let us know if you'd like to proceed with any of these features. We'd be happy to assist you! 💖`

const normalizeWhatsAppPhone = (phone) => {
  if (!phone) return ''
  return String(phone).replace(/\D/g, '')
}

export const buildWhatsAppUrl = (phone) => {
  const digits = normalizeWhatsAppPhone(phone)
  if (!digits) return ''
  return `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_FOLLOW_UP_MESSAGE)}`
}

const EventViewModal = ({ visible, event, onClose }) => {
  const [copied, setCopied] = useState(false)
  const [copying, setCopying] = useState(false)

  const brideShort = event?.bride_short_name || ''
  const groomShort = event?.groom_short_name || ''
  const phone = event?.contact_phone || ''
  const email = event?.email || ''
  const whatsappUrl = useMemo(() => buildWhatsAppUrl(phone), [phone])
  const preferences = useMemo(() => parsePreferences(event?.preferences), [event?.preferences])

  const welcomeEmail = useMemo(
    () => buildWelcomeEmail(brideShort, groomShort),
    [brideShort, groomShort],
  )

  const coupleLabel = useMemo(() => {
    const bride = brideShort.trim()
    const groom = groomShort.trim()
    if (bride && groom) return `${bride} & ${groom}`
    if (bride || groom) return bride || groom
    return event?.name || 'Wedding Event'
  }, [brideShort, groomShort, event?.name])

  const interestItems = useMemo(() => {
    const knownByKey = Object.fromEntries(PREFERENCE_META.map((item) => [item.key, item.label]))
    const keys = Object.keys(preferences)

    if (keys.length === 0) return []

    const orderedKnown = PREFERENCE_META
      .filter((meta) => Object.prototype.hasOwnProperty.call(preferences, meta.key))
      .map((meta) => ({
        key: meta.key,
        label: meta.label,
        interested: !!preferences[meta.key],
      }))

    const extras = keys
      .filter((key) => !knownByKey[key])
      .map((key) => ({
        key,
        label: key
          .split('_')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' '),
        interested: !!preferences[key],
      }))

    return [...orderedKnown, ...extras]
  }, [preferences])

  const hasAnyPreference = Object.keys(preferences).length > 0
  const interestedCount = interestItems.filter((item) => item.interested).length

  useEffect(() => {
    if (!visible) {
      setCopied(false)
      setCopying(false)
    }
  }, [visible])

  const handleCopyEmail = async () => {
    setCopying(true)
    const ok = await copyToClipboard(welcomeEmail)
    setCopying(false)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleOpenCard = () => {
    if (!event?.id) return
    const user = authService.getCurrentUser()
    const url = `${config.CARD_BASE_URL}/${user.merchantId}/${event.id}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!event) return null

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      alignment="center"
      size="lg"
      scrollable
      className="event-view-modal"
    >
      <CModalBody className="event-view-body p-0">
        <div className="event-view-hero">
          <div className="event-view-hero-icon" aria-hidden>
            <CIcon icon={cilHeart} size="lg" />
          </div>
          <p className="event-view-eyebrow">Couple overview</p>
          <h3 className="event-view-couple">{coupleLabel}</h3>
          {event.name && coupleLabel !== event.name && (
            <p className="event-view-event-name">{event.name}</p>
          )}
        </div>

        <div className="event-view-content">
          <section className="event-view-section">
            <h4 className="event-view-section-title">Contact</h4>
            <div className="event-view-info-grid">
              <div className="event-view-info-card">
                <div className="event-view-info-label">
                  <CIcon icon={cilHeart} size="sm" />
                  Bride
                </div>
                <div className="event-view-info-value">
                  {brideShort.trim() || <span className="text-muted">Not set</span>}
                </div>
              </div>
              <div className="event-view-info-card">
                <div className="event-view-info-label">
                  <CIcon icon={cilHeart} size="sm" />
                  Groom
                </div>
                <div className="event-view-info-value">
                  {groomShort.trim() || <span className="text-muted">Not set</span>}
                </div>
              </div>
              <div className="event-view-info-card">
                <div className="event-view-info-label">
                  <CIcon icon={cilPhone} size="sm" />
                  Phone
                </div>
                <div className="event-view-info-value">
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-view-phone-link"
                      title="Open WhatsApp"
                    >
                      {phone}
                    </a>
                  ) : (
                    <span className="text-muted">Not provided</span>
                  )}
                </div>
              </div>
              <div className="event-view-info-card">
                <div className="event-view-info-label">
                  <CIcon icon={cilEnvelopeClosed} size="sm" />
                  Email
                </div>
                <div className="event-view-info-value event-view-info-value--wrap">
                  {email ? (
                    <a href={`mailto:${email}`} className="event-view-phone-link">
                      {email}
                    </a>
                  ) : (
                    <span className="text-muted">Not provided</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="event-view-section">
            <div className="event-view-section-head">
              <h4 className="event-view-section-title mb-0">
                <CIcon icon={cilStar} size="sm" className="me-1" />
                Interests
              </h4>
              {hasAnyPreference && (
                <span className="event-view-interest-count">
                  {interestedCount} selected
                </span>
              )}
            </div>

            {!hasAnyPreference ? (
              <p className="event-view-empty mb-0">No preferences recorded for this event.</p>
            ) : (
              <div className="event-view-interest-list">
                {interestItems.map((item) => (
                  <div
                    key={item.key}
                    className={`event-view-interest-chip ${item.interested ? 'is-active' : 'is-inactive'}`}
                  >
                    <span className="event-view-interest-dot" aria-hidden />
                    <span>{item.label}</span>
                    <span className="event-view-interest-status">
                      {item.interested ? 'Interested' : 'Not interested'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="event-view-section">
            <div className="event-view-section-head">
              <h4 className="event-view-section-title mb-0">
                <CIcon icon={cilEnvelopeClosed} size="sm" className="me-1" />
                Welcome email
              </h4>
            </div>
            <p className="event-view-email-hint">
              Personalized for {coupleLabel}. Copy and send it to the couple.
            </p>

            {copied && (
              <CAlert color="success" className="event-view-copied-banner mb-3">
                <CIcon icon={cilCheckAlt} className="me-2" />
                Welcome email copied — paste it into your mail client
              </CAlert>
            )}

            <div className="event-view-email-box">
              <pre className="event-view-email-preview">{welcomeEmail}</pre>
              <CButton
                color={copied ? 'success' : 'primary'}
                className="event-view-copy-btn"
                onClick={handleCopyEmail}
                disabled={copying}
              >
                {copying ? (
                  <CSpinner size="sm" className="me-2" />
                ) : (
                  <CIcon icon={copied ? cilCheckAlt : cilCopy} className="me-2" />
                )}
                {copied ? 'Copied!' : 'Copy welcome email'}
              </CButton>
            </div>
          </section>
        </div>
      </CModalBody>

      <CModalFooter className="event-view-footer">
        <CButton color="secondary" variant="outline" onClick={onClose}>
          Close
        </CButton>
        <CButton
          color="primary"
          variant="outline"
          onClick={handleOpenCard}
          className="d-flex align-items-center gap-2"
        >
          <CIcon icon={cilExternalLink} size="sm" />
          Open card
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default EventViewModal
