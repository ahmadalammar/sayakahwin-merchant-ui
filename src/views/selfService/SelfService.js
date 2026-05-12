import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CContainer,
  CSpinner,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTags,
  cilWarning,
  cilCheckCircle,
  cilHeart,
  cilLockLocked,
} from '@coreui/icons'

import selfServiceService from '../../services/selfServiceService'
import { setCouponAuth, clearCouponAuth } from '../../services/api'
import { SelfServiceProvider } from '../../context/SelfServiceContext'
import PageTitle from '../../components/PageTitle'
import CreateEvent from '../events/CreateEvent'
import UpdateEvent from '../events/UpdateEvent'

const purple = 'var(--sk-purple, #2D1B4E)'
const pink = 'var(--sk-pink, #E8A0B0)'

const useQuery = () => {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

const FullPageMessage = ({ icon, iconColor = '#dc3545', title, message, children }) => (
  <div
    style={{
      minHeight: '100vh',
      background:
        'linear-gradient(160deg, rgba(45, 27, 78, 0.06) 0%, #FAF8F7 45%, rgba(232, 160, 176, 0.12) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}
  >
    <CCard
      className="border-0"
      style={{
        maxWidth: 520,
        width: '100%',
        boxShadow: '0 12px 40px rgba(45, 27, 78, 0.08)',
        borderRadius: 20,
      }}
    >
      <CCardBody className="p-5 text-center">
        <div
          className="d-inline-flex align-items-center justify-content-center mb-3"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `${iconColor}1a`,
            color: iconColor,
          }}
        >
          <CIcon icon={icon} size="xxl" />
        </div>
        <h4 className="mb-2" style={{ color: purple }}>
          {title}
        </h4>
        <p className="text-muted mb-4">{message}</p>
        {children}
      </CCardBody>
    </CCard>
  </div>
)

const CouponBanner = ({ couponValue, amount, merchantName, mode }) => {
  const amt = Number(amount || 0) || 1
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${purple} 0%, #3d2566 55%, ${pink} 100%)`,
        color: '#fff',
        padding: '28px 20px',
        marginBottom: 24,
      }}
    >
      <div
        className="mx-auto d-flex flex-column flex-md-row align-items-center align-items-md-end justify-content-between gap-3"
        style={{ maxWidth: 1280 }}
      >
        <div className="text-center text-md-start">
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2"
            style={{
              background: 'rgba(255,255,255,0.18)',
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            <CIcon icon={cilHeart} size="sm" />
            Sayakahwin Self-Service
          </div>
          <h3
            className="mb-1 fw-semibold"
            style={{
              fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            {mode === 'update'
              ? 'Continue your wedding card'
              : "You're invited to create your wedding card"}
          </h3>
          <p className="mb-0" style={{ opacity: 0.92, fontSize: '0.95rem', color: '#fff' }}>
            {mode === 'update'
              ? 'Use this private link to edit your invitation any time.'
              : 'Use this private link to design and publish your invitation.'}
            {merchantName ? ` Provided by ${merchantName}.` : ''}
          </p>
        </div>

        <div
          className="text-center"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 16,
            padding: '12px 18px',
            minWidth: 240,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.85,
              marginBottom: 4,
            }}
          >
            Coupon Code
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              wordBreak: 'break-all',
            }}
          >
            {couponValue || 'N/A'}
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 4 }}>
            Worth <strong>{amt}</strong> credit{amt === 1 ? '' : 's'}
            {mode === 'update' ? ' · already claimed' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

const SelfService = () => {
  const { merchantId } = useParams()
  const query = useQuery()
  const couponValue = query.get('coupon')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // existingEvent is null when there's no event yet (-> create flow)
  // It's an object when one is found (-> update flow)
  const [existingEvent, setExistingEvent] = useState(null)
  const [responseMeta, setResponseMeta] = useState(null)

  // Activate coupon-based auth while this page is mounted
  useEffect(() => {
    if (!couponValue) return
    setCouponAuth(couponValue)
    return () => {
      clearCouponAuth()
    }
  }, [couponValue])

  const discoverEvent = useCallback(async () => {
    if (!merchantId) {
      setError('This link is missing the merchant information.')
      setLoading(false)
      return
    }
    if (!couponValue) {
      setError('Missing coupon value in the link.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await selfServiceService.fetchEventByCoupon(merchantId, couponValue)
      // Handle a few possible response shapes:
      //   { id, ...event }                          -> update flow
      //   { event: { id, ... }, ...couponMeta }     -> update flow with extra meta
      //   { eventId, ...couponMeta }                -> update flow (just the id)
      //   null / { event: null }                    -> create flow
      const event = data?.event ?? (data?.id ? data : null)
      const eventId = event?.id || data?.eventId || data?.event_id || event?.eventId || null
      setExistingEvent(event || (eventId ? { id: eventId } : null))
      setResponseMeta(data || null)
    } catch (err) {
      const status = err.response?.status
      if (status === 404) {
        // No event yet for this coupon → create flow
        setExistingEvent(null)
        setResponseMeta(err.response?.data || null)
        return
      }
      const message =
        err.response?.data?.message ||
        (status === 401 || status === 403
          ? 'This coupon is invalid or has expired.'
          : status === 410 || status === 409
            ? 'This coupon can no longer be used.'
            : err.message || 'Unable to verify this coupon.')
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [merchantId, couponValue])

  useEffect(() => {
    discoverEvent()
  }, [discoverEvent])

  const handleEventCreated = useCallback((created) => {
    const newEventId =
      created?.id || created?.eventId || created?.event_id || null
    if (newEventId) {
      setExistingEvent({ id: newEventId, ...created })
    }
  }, [])

  const mode = existingEvent?.id ? 'update' : 'create'

  // Coupon meta from the response if available
  const couponAmount =
    responseMeta?.coupon?.amount ??
    responseMeta?.couponAmount ??
    responseMeta?.amount ??
    null
  const merchantName =
    responseMeta?.merchantName ||
    responseMeta?.merchant_name ||
    responseMeta?.merchant?.name ||
    responseMeta?.merchant?.brand_name ||
    null

  // The by-coupon response also carries the merchant's add-on feature flags.
  // Surface them as a subscription-like object so CreateEvent/UpdateEvent
  // can apply the same hide/show rules used in the merchant flow.
  const subscriptionFromCoupon = useMemo(() => {
    if (!responseMeta) return null
    const keys = [
      'enable_addon',
      'enable_qr_code',
      'enable_seating_arrangement',
      'enable_event_grouping',
      'enable_rsvp_reminders',
    ]
    const subset = {}
    let hasAnyFlag = false
    keys.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(responseMeta, k)) {
        subset[k] = responseMeta[k]
        hasAnyFlag = true
      }
    })
    return hasAnyFlag ? subset : null
  }, [responseMeta])

  if (loading) {
    return (
      <>
        <PageTitle title="Self Service" description="Claim your Sayakahwin coupon" />
        <div
          style={{
            minHeight: '100vh',
            background:
              'linear-gradient(160deg, rgba(45, 27, 78, 0.06) 0%, #FAF8F7 45%, rgba(232, 160, 176, 0.12) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <CSpinner style={{ color: purple }} />
          <p className="text-muted mb-0">Verifying your coupon...</p>
        </div>
      </>
    )
  }

  if (!couponValue) {
    return (
      <>
        <PageTitle title="Self Service" description="Claim your Sayakahwin coupon" />
        <FullPageMessage
          icon={cilLockLocked}
          iconColor="#dc3545"
          title="No coupon provided"
          message="This link is missing a coupon code. Please use the share link given to you."
        />
      </>
    )
  }

  if (!merchantId) {
    return (
      <>
        <PageTitle title="Self Service" description="Claim your Sayakahwin coupon" />
        <FullPageMessage
          icon={cilLockLocked}
          iconColor="#dc3545"
          title="Invalid link"
          message="This link is missing the merchant information. Please ask for an updated link."
        />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageTitle title="Self Service" description="Claim your Sayakahwin coupon" />
        <FullPageMessage
          icon={cilWarning}
          iconColor="#dc3545"
          title="Coupon not available"
          message={error}
        >
          <CButton color="primary" variant="outline" onClick={discoverEvent}>
            Try again
          </CButton>
        </FullPageMessage>
      </>
    )
  }

  return (
    <>
      <PageTitle
        title={mode === 'update' ? 'Edit Wedding Card' : 'Create Wedding Card'}
        description="Sayakahwin self-service coupon claim"
      />
      <div
        style={{
          minHeight: '100vh',
          background:
            'linear-gradient(160deg, rgba(45, 27, 78, 0.04) 0%, #FAF8F7 30%, rgba(232, 160, 176, 0.08) 100%)',
        }}
      >
        <CouponBanner
          couponValue={couponValue}
          amount={couponAmount}
          merchantName={merchantName}
          mode={mode}
        />

        <CContainer fluid style={{ paddingBottom: 48 }}>
          {mode === 'update' && (
            <CAlert color="info" className="mx-auto mb-4" style={{ maxWidth: 1280 }}>
              <div className="d-flex align-items-start gap-2">
                <CIcon icon={cilCheckCircle} className="flex-shrink-0 mt-1" />
                <div>
                  <strong>This coupon has been redeemed.</strong>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    You can keep editing your wedding card details below.
                  </div>
                </div>
              </div>
            </CAlert>
          )}

          {mode === 'create' && (
            <div
              className="mx-auto mb-3 d-flex align-items-center gap-2 flex-wrap"
              style={{ maxWidth: 1280 }}
            >
              <CBadge color="success" className="px-3 py-2 d-inline-flex align-items-center gap-1">
                <CIcon icon={cilTags} size="sm" />
                Coupon ready to claim
              </CBadge>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                Submitting the form below will claim this coupon and publish your wedding card.
              </span>
            </div>
          )}

          <SelfServiceProvider
            value={{
              isSelfService: true,
              couponValue,
              merchantId,
              eventId: existingEvent?.id || null,
              event: existingEvent,
              meta: responseMeta,
              subscription: subscriptionFromCoupon,
              onEventCreated: handleEventCreated,
            }}
          >
            {mode === 'update' && existingEvent?.id ? <UpdateEvent /> : <CreateEvent />}
          </SelfServiceProvider>
        </CContainer>
      </div>
    </>
  )
}

export default SelfService
