/**
 * Subscription credit helpers for coupon reservation logic.
 * Pending unredeemed coupons reserve capacity against merchant credits.
 */

export const pendingCoupons = (history) => {
  if (!Array.isArray(history)) return []
  return history.filter((t) => t.transaction_type === 'coupon' && !t.related_event_id)
}

export const reservedCredits = (history) => {
  return pendingCoupons(history).reduce((sum, t) => sum + Number(t.amount || 0), 0)
}

export const effectiveAvailableCredits = (sub) => {
  if (!sub) return 0
  const remaining = Number(sub.event_credits_remaining ?? 0)
  return remaining - reservedCredits(sub.history)
}

export const couponHistory = (history) => {
  if (!Array.isArray(history)) return []
  return history.filter((t) => t.transaction_type === 'coupon')
}

export const isCouponRedeemed = (coupon) => {
  if (!coupon) return false
  if (coupon.redeemed === true) return true
  if (coupon.related_event_id) return true
  return false
}

export const getCouponStatus = (coupon) => (isCouponRedeemed(coupon) ? 'redeemed' : 'pending')
