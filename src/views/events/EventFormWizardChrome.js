import React, { useEffect, useRef, useState } from 'react'
import { CButton, CProgress, CSpinner } from '@coreui/react'

export const EVENT_FORM_WIZARD_STEPS = [
  {
    key: 'design',
    short: 'Design',
    title: 'Card design',
    hint: 'Choose a preset template or use your own custom layout with optional page images.',
  },
  {
    key: 'couple',
    short: 'Couple',
    title: 'Couple & language',
    hint: 'Names, details, and the language shown on your invitation.',
  },
  {
    key: 'messages',
    short: 'Details',
    title: 'Card details & messages',
    hint: 'Opening, parent note, event information, and a closing message.',
  },
  {
    key: 'schedule',
    short: 'Schedule',
    title: 'Schedule & timeline',
    hint: 'Ceremony dates, featured highlight, and optional itinerary.',
  },
  {
    key: 'media',
    short: 'Media',
    title: 'Music & gallery',
    hint: 'Optional background song and photo gallery.',
  },
  {
    key: 'gifts',
    short: 'Gifts',
    title: 'Gifts & money gifts',
    hint: 'Wishlist and bank details for monetary gifts.',
  },
  {
    key: 'contact',
    short: 'RSVP',
    title: 'Contact & RSVP',
    hint: 'Who guests can call and how RSVP behaves.',
  },
  {
    key: 'addons',
    short: 'Add-ons',
    title: 'Add-on packages',
    hint: 'Check-in, reminders, seating, and guest grouping.',
  },
  {
    key: 'final',
    short: 'Final',
    title: 'Final touches',
    hint: 'Pick a celebration animation and review before publishing.',
  },
]

const purple = 'var(--sk-purple, #2D1B4E)'
const pink = 'var(--sk-pink, #E8A0B0)'

export default function EventFormWizardChrome({ activeStep, onStepChange }) {
  const scrollRef = useRef(null)
  const [wideLayout, setWideLayout] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)')
    const apply = () => setWideLayout(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (wideLayout) return
    const root = scrollRef.current
    if (!root) return
    const active = root.querySelector(`[data-wizard-step="${activeStep}"]`)
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeStep, wideLayout])

  const pct = ((activeStep + 1) / EVENT_FORM_WIZARD_STEPS.length) * 100
  const total = EVENT_FORM_WIZARD_STEPS.length

  return (
    <div
      className="mb-4 p-4 p-lg-4 rounded-4 mx-auto"
      style={{
        maxWidth: 1280,
        background: 'linear-gradient(160deg, rgba(45, 27, 78, 0.05) 0%, rgba(255, 255, 255, 0.92) 38%, rgba(232, 160, 176, 0.09) 100%)',
        border: '1px solid rgba(45, 27, 78, 0.1)',
        boxShadow: '0 12px 40px rgba(45, 27, 78, 0.08), 0 1px 0 rgba(255,255,255,0.8) inset',
      }}
    >
      <div className="text-center text-xl-start mb-3">
        <p
          className="text-uppercase fw-semibold mb-2"
          style={{ color: purple, letterSpacing: '0.12em', fontSize: '0.72rem', opacity: 0.85 }}
        >
          Wedding card wizard
        </p>
        <div className="d-flex flex-column flex-xl-row align-items-center align-items-xl-end justify-content-xl-between gap-3">
          <div>
            <h4 className="mb-1 fw-semibold" style={{ color: purple, fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)' }}>
              {EVENT_FORM_WIZARD_STEPS[activeStep].title}
            </h4>
            <p className="text-muted mb-0 mx-auto mx-xl-0" style={{ fontSize: '0.95rem', lineHeight: 1.5, maxWidth: 520 }}>
              {EVENT_FORM_WIZARD_STEPS[activeStep].hint}
            </p>
          </div>
          <div
            className="d-flex align-items-center gap-3 px-3 py-2 rounded-pill flex-shrink-0"
            style={{ background: 'rgba(45, 27, 78, 0.06)', border: '1px solid rgba(45, 27, 78, 0.08)' }}
          >
            <span className="text-muted small fw-semibold" style={{ fontSize: '0.8rem' }}>
              Step <span style={{ color: purple }}>{activeStep + 1}</span> / {total}
            </span>
            <span className="text-muted" style={{ opacity: 0.35 }}>
              |
            </span>
            <span style={{ color: purple, fontSize: '0.9rem', fontWeight: 700 }}>{Math.round(pct)}%</span>
          </div>
        </div>
      </div>

      <div
        className="rounded-pill p-1 mb-4"
        style={{ background: 'rgba(45, 27, 78, 0.07)', boxShadow: 'inset 0 1px 3px rgba(45,27,78,0.08)' }}
      >
        <CProgress
          className="progress rounded-pill overflow-visible"
          style={{ height: 10 }}
          value={pct}
          color="primary"
        />
      </div>

      <div
        ref={scrollRef}
        className={`d-flex pb-1 ${wideLayout ? 'flex-nowrap' : 'flex-wrap justify-content-center'} gap-3`}
        style={
          wideLayout
            ? { gap: '0.65rem' }
            : {
                rowGap: '14px',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollSnapType: 'x proximity',
                scrollbarWidth: 'thin',
                paddingBottom: 4,
                justifyContent: 'center',
              }
        }
      >
        {EVENT_FORM_WIZARD_STEPS.map((s, i) => {
          const done = i < activeStep
          const cur = i === activeStep
          return (
            <button
              key={s.key}
              type="button"
              data-wizard-step={i}
              aria-label={`Step ${i + 1}: ${s.title}`}
              aria-current={cur ? 'step' : undefined}
              onClick={() => onStepChange(i)}
              className={`text-center border-0 ${wideLayout ? 'flex-grow-1' : ''}`}
              style={{
                scrollSnapAlign: 'center',
                flex: wideLayout ? '1 1 0' : '0 1 auto',
                minWidth: wideLayout ? 0 : 122,
                maxWidth: wideLayout ? 'none' : 148,
                padding: '16px 14px',
                minHeight: 78,
                borderRadius: 18,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: cur ? `2px solid ${pink}` : '1px solid rgba(45, 27, 78, 0.1)',
                background: cur
                  ? `linear-gradient(165deg, ${purple} 0%, #3d2566 100%)`
                  : done
                    ? 'rgba(45, 27, 78, 0.08)'
                    : '#fff',
                color: cur ? '#fff' : done ? purple : '#5c5f62',
                fontWeight: 600,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                boxShadow: cur
                  ? `0 10px 28px rgba(45, 27, 78, 0.28), 0 0 0 4px rgba(232, 160, 176, 0.25)`
                  : '0 4px 14px rgba(45, 27, 78, 0.06)',
                transform: cur ? 'translateY(-2px)' : 'none',
                cursor: 'pointer',
              }}
            >
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold"
                style={{
                  width: 34,
                  height: 34,
                  fontSize: '0.8rem',
                  background: cur ? 'rgba(255,255,255,0.2)' : done ? 'rgba(45, 27, 78, 0.15)' : 'rgba(45, 27, 78, 0.06)',
                  color: cur ? '#fff' : done ? purple : '#6c757d',
                  border: cur ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(45, 27, 78, 0.08)',
                }}
              >
                {done && !cur ? '✓' : i + 1}
              </span>
              <span
                className="d-block px-1"
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.25,
                  fontWeight: cur ? 700 : 600,
                  letterSpacing: cur ? '0.01em' : 'normal',
                }}
              >
                {s.short}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const LAST_STEP_INDEX = EVENT_FORM_WIZARD_STEPS.length - 1

export function EventFormWizardNav({
  step,
  setStep,
  loading,
  cancelHref,
  hideCancel = false,
  submitLabel,
  loadingSubmitLabel,
}) {
  const go = (next) => {
    setStep(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4 px-1">
      <CButton
        type="button"
        color="secondary"
        variant="outline"
        className="border order-2 order-md-1"
        disabled={step === 0}
        onClick={() => go(step - 1)}
      >
        Back
      </CButton>
      <div className="d-flex flex-column flex-sm-row gap-2 justify-content-md-end flex-grow-1 order-1 order-md-2">
        {step < LAST_STEP_INDEX ? (
          <CButton type="button" color="primary" className="px-4" onClick={() => go(step + 1)}>
            Continue
          </CButton>
        ) : (
          <>
            {!hideCancel && (
              <CButton type="button" color="secondary" variant="outline" href={cancelHref}>
                Cancel
              </CButton>
            )}
            <CButton type="submit" color="primary" disabled={loading} className="px-4">
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  {loadingSubmitLabel}
                </>
              ) : (
                submitLabel
              )}
            </CButton>
          </>
        )}
      </div>
    </div>
  )
}
