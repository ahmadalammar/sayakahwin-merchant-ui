import React, { useEffect } from 'react'
import { CTooltip, CBadge, CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilQrCode, cilBell, cilPeople, cilGrid, cilInfo } from '@coreui/icons'

const purple = 'var(--sk-purple, #2D1B4E)'
const border = '#E5E0E8'
const muted = '#6c757d'

const AddonToggleCard = ({
  id,
  icon,
  title,
  description,
  checked,
  onChange,
  accent,
}) => (
  <label
    htmlFor={id}
    className="event-addon-card"
    style={{
      display: 'block',
      cursor: 'pointer',
      margin: 0,
      borderRadius: 14,
      border: `2px solid ${checked ? accent : border}`,
      background: checked
        ? `linear-gradient(145deg, ${accent}12 0%, ${accent}06 55%, #fff 100%)`
        : 'linear-gradient(180deg, #fff 0%, #FAF8F7 100%)',
      padding: '18px 18px 16px',
      transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease, background 0.25s ease',
      boxShadow: checked ? `0 6px 20px ${accent}22` : '0 2px 8px rgba(45, 27, 78, 0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{
        position: 'absolute',
        opacity: 0,
        width: 0,
        height: 0,
      }}
    />
    <div className="d-flex align-items-start justify-content-between gap-3">
      <div
        className="d-flex align-items-center justify-content-center flex-shrink-0"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: checked ? `${accent}18` : 'rgba(45, 27, 78, 0.06)',
          color: checked ? accent : purple,
          transition: 'background 0.25s ease, color 0.25s ease',
        }}
      >
        <CIcon icon={icon} size="lg" />
      </div>
      <div
        className="rounded-pill flex-shrink-0"
        style={{
          width: 48,
          height: 28,
          background: checked ? accent : '#dee2e6',
          position: 'relative',
          transition: 'background 0.25s ease',
          boxShadow: checked ? `inset 0 1px 2px ${accent}88` : 'inset 0 1px 2px rgba(0,0,0,0.06)',
        }}
        aria-hidden
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 24 : 3,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
    <div className="mt-3">
      <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: checked ? accent : '#343a40' }}>{title}</span>
        <CBadge color="warning" className="text-dark" style={{ fontSize: '0.65rem', padding: '3px 8px', fontWeight: 600 }}>
          ADD-ON
        </CBadge>
        <CTooltip content={description}>
          <span className="d-inline-flex" style={{ cursor: 'help' }}>
            <CIcon icon={cilInfo} className="text-muted" size="sm" />
          </span>
        </CTooltip>
      </div>
      <p className="mb-0" style={{ fontSize: '0.8125rem', color: muted, lineHeight: 1.45 }}>
        {description}
      </p>
    </div>
  </label>
)

// Treat a flag value as disabled when it's explicitly false / 0 / "0" / "false".
// Missing values (undefined/null) default to enabled so loading and self-service
// states keep the UI usable.
export const isFeatureFlagEnabled = (value) => {
  if (value === undefined || value === null) return true
  if (value === false || value === 0 || value === '0' || value === 'false') return false
  return true
}

const isFeatureEnabled = (subscription, key) => isFeatureFlagEnabled(subscription?.[key])

const EventAddonsSection = ({
  subscription,
  allowCheckin,
  setAllowCheckin,
  isReminderEnabled,
  setIsReminderEnabled,
  isSeatingEnabled,
  setIsSeatingEnabled,
  isGroupingFeatureEnabled,
  setIsGroupingFeatureEnabled,
}) => {
  // When subscription flags change, clear any toggle the merchant no longer has access to.
  useEffect(() => {
    if (!subscription) return
    if (!isFeatureEnabled(subscription, 'enable_qr_code') && allowCheckin) {
      setAllowCheckin(false)
    }
    if (!isFeatureEnabled(subscription, 'enable_rsvp_reminders') && isReminderEnabled) {
      setIsReminderEnabled(false)
    }
    if (!isFeatureEnabled(subscription, 'enable_seating_arrangement') && isSeatingEnabled) {
      setIsSeatingEnabled(false)
    }
    if (!isFeatureEnabled(subscription, 'enable_event_grouping') && isGroupingFeatureEnabled) {
      setIsGroupingFeatureEnabled(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription])

  const allItems = [
    {
      id: 'addon_allow_checkin',
      icon: cilQrCode,
      title: 'Check-in & QR',
      description: 'Let guests check in with a QR code so you can track attendance.',
      checked: allowCheckin,
      onChange: setAllowCheckin,
      accent: '#d97706',
      featureFlag: 'enable_qr_code',
    },
    {
      id: 'addon_reminder',
      icon: cilBell,
      title: 'RSVP reminders',
      description: 'Send reminders to guests who have not responded yet.',
      checked: isReminderEnabled,
      onChange: setIsReminderEnabled,
      accent: '#7c3aed',
      featureFlag: 'enable_rsvp_reminders',
    },
    {
      id: 'addon_seating',
      icon: cilPeople,
      title: 'Seating',
      description: 'Assign tables and seats and show them on the guest experience.',
      checked: isSeatingEnabled,
      onChange: setIsSeatingEnabled,
      accent: '#0d9488',
      featureFlag: 'enable_seating_arrangement',
    },
    {
      id: 'addon_grouping',
      icon: cilGrid,
      title: 'Event grouping',
      description: 'Group guests (e.g. by side or batch) for a clearer guest list.',
      checked: isGroupingFeatureEnabled,
      onChange: setIsGroupingFeatureEnabled,
      accent: '#2563eb',
      featureFlag: 'enable_event_grouping',
    },
  ]

  const items = allItems.filter((item) => isFeatureEnabled(subscription, item.featureFlag))

  if (items.length === 0) {
    return (
      <CAlert color="info" className="mb-0">
        Add-on features are not available on your current plan.
      </CAlert>
    )
  }

  return (
    <div
      className="event-addons-wrap"
      style={{
        padding: '4px 2px 8px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(45, 27, 78, 0.04) 0%, rgba(45, 27, 78, 0.02) 50%, transparent 100%)',
      }}
    >
      <p className="text-muted mb-3" style={{ fontSize: '0.875rem', maxWidth: 640 }}>
        Turn on the features you need. These extend your invitation with optional tools for guests and planning.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {items.map((item) => {
          // strip non-DOM props before spreading
          const { featureFlag, ...cardProps } = item
          return <AddonToggleCard key={item.id} {...cardProps} />
        })}
      </div>
    </div>
  )
}

export default EventAddonsSection
