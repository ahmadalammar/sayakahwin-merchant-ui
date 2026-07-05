import { useState, useEffect, useCallback, useMemo } from 'react'
import merchantService from '../services/merchantService'
import authService from '../services/auth'
import {
  reservedCredits,
  effectiveAvailableCredits,
  pendingCoupons,
  couponHistory,
} from '../utils/subscriptionCredits'

const useSubscription = () => {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async ({ silent = false } = {}) => {
    const user = authService.getCurrentUser()
    if (!user || !user.merchantId) {
      if (!silent) setLoading(false)
      return null
    }

    if (!silent) {
      setLoading(true)
      setError(null)
    }

    try {
      const sub = await merchantService.getSubscription()
      setSubscription(sub)
      return sub
    } catch (err) {
      if (!silent) {
        setError(err.response?.data?.message || err.message || 'Failed to load subscription.')
      }
      return null
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const history = subscription?.history ?? []

  const credits = useMemo(
    () => ({
      available: Number(subscription?.event_credits_remaining ?? 0),
      reserved: reservedCredits(history),
      effectiveAvailable: effectiveAvailableCredits(subscription),
      pendingCount: pendingCoupons(history).length,
    }),
    [subscription, history],
  )

  const coupons = useMemo(() => couponHistory(history), [history])

  return {
    subscription,
    loading,
    error,
    refetch,
    credits,
    coupons,
  }
}

export default useSubscription
