import React from 'react'
import { CAlert, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning, cilArrowRight } from '@coreui/icons'
import { EVENT_FORM_WIZARD_STEPS } from './EventFormWizardChrome'

// Static mapping of known error keys -> { stepIndex, label }
const ERROR_FIELD_MAP = {
  template: { stepIndex: 0, label: 'Invitation design' },
  groom_name: { stepIndex: 1, label: "Groom's name" },
  groom_father_name: { stepIndex: 1, label: "Groom's parent name" },
  bride_name: { stepIndex: 1, label: "Bride's name" },
  bride_father_name: { stepIndex: 1, label: "Bride's parent name" },
  email: { stepIndex: 1, label: 'Email address' },
}

// Resolve dynamically-keyed errors like "schedule_title_0", "contact_name_2"
const matchDynamicError = (key) => {
  const scheduleMatch = key.match(/^schedule_(title|date|address)_(\d+)$/)
  if (scheduleMatch) {
    const [, field, index] = scheduleMatch
    const fieldLabel = { title: 'Title', date: 'Date', address: 'Address' }[field]
    return {
      stepIndex: 3,
      label: `Schedule #${Number(index) + 1} — ${fieldLabel}`,
    }
  }
  const contactMatch = key.match(/^contact_(name|phone)_(\d+)$/)
  if (contactMatch) {
    const [, field, index] = contactMatch
    const fieldLabel = { name: 'Name', phone: 'Phone number' }[field]
    return {
      stepIndex: 6,
      label: `Contact #${Number(index) + 1} — ${fieldLabel}`,
    }
  }
  return null
}

const humanizeKey = (key) =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

export const groupErrorsByStep = (errors) => {
  if (!errors) return []
  const groups = new Map()
  Object.keys(errors).forEach((key) => {
    const message = errors[key]
    if (!message) return
    const info =
      ERROR_FIELD_MAP[key] ||
      matchDynamicError(key) || { stepIndex: -1, label: humanizeKey(key) }
    if (!groups.has(info.stepIndex)) groups.set(info.stepIndex, [])
    groups.get(info.stepIndex).push({ field: key, label: info.label, message })
  })
  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === -1) return 1
      if (b === -1) return -1
      return a - b
    })
    .map(([stepIndex, items]) => ({
      stepIndex,
      stepNumber: stepIndex >= 0 ? stepIndex + 1 : null,
      stepLabel:
        stepIndex >= 0 && EVENT_FORM_WIZARD_STEPS[stepIndex]
          ? EVENT_FORM_WIZARD_STEPS[stepIndex].title
          : 'Other',
      items,
    }))
}

export const firstErrorStepIndex = (errors) => {
  const groups = groupErrorsByStep(errors)
  const first = groups.find((g) => g.stepIndex >= 0)
  return first ? first.stepIndex : -1
}

const EventFormErrorSummary = ({ errors, onJumpToStep }) => {
  const groups = groupErrorsByStep(errors)
  const total = groups.reduce((sum, g) => sum + g.items.length, 0)
  if (total === 0) return null

  return (
    <CAlert
      color="danger"
      className="mb-4"
      style={{
        borderLeft: '4px solid var(--cui-danger, #dc3545)',
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-3">
        <CIcon icon={cilWarning} />
        <strong style={{ fontSize: '1rem' }}>
          Please fix {total} {total === 1 ? 'error' : 'errors'} before submitting
        </strong>
      </div>
      <div className="d-flex flex-column gap-3">
        {groups.map((g) => (
          <div
            key={g.stepIndex}
            className="p-3 rounded"
            style={{
              background: 'rgba(220, 53, 69, 0.06)',
              border: '1px solid rgba(220, 53, 69, 0.18)',
            }}
          >
            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
              {g.stepNumber !== null && (
                <span
                  className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
                  style={{
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    background: 'var(--cui-danger, #dc3545)',
                    color: '#fff',
                  }}
                >
                  {g.stepNumber}
                </span>
              )}
              <strong style={{ fontSize: '0.9375rem' }}>{g.stepLabel}</strong>
              <span
                className="px-2 py-1 rounded-pill"
                style={{
                  fontSize: '0.72rem',
                  background: 'rgba(220, 53, 69, 0.12)',
                  color: 'var(--cui-danger, #dc3545)',
                  fontWeight: 600,
                }}
              >
                {g.items.length} {g.items.length === 1 ? 'issue' : 'issues'}
              </span>
              {g.stepIndex >= 0 && (
                <CButton
                  type="button"
                  size="sm"
                  color="danger"
                  variant="outline"
                  className="ms-auto d-inline-flex align-items-center gap-1 py-1 px-2"
                  onClick={() => onJumpToStep && onJumpToStep(g.stepIndex)}
                >
                  Go to step
                  <CIcon icon={cilArrowRight} size="sm" />
                </CButton>
              )}
            </div>
            <ul className="mb-0 ps-3" style={{ fontSize: '0.875rem' }}>
              {g.items.map((item) => (
                <li key={item.field} className="mb-1">
                  <strong>{item.label}:</strong>{' '}
                  <span className="text-muted">{item.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </CAlert>
  )
}

export default EventFormErrorSummary
