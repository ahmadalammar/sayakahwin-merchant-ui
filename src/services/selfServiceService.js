import api from './api'

// Discover whether an event has already been claimed for this coupon.
// Sends the coupon value in the X-Coupon-Value header (no merchant token).
//
//   GET /merchant/:merchantId/events/by-coupon
//   Headers: X-Coupon-Value: <couponValue>
//
//   200 -> event details (existing event tied to this coupon) -> Update flow
//   404 -> no event yet                                       -> Create flow
//
// The endpoint may also return useful coupon/merchant metadata
// (amount, status, merchantName, ...) which the page will surface in the banner.
const fetchEventByCoupon = async (merchantId, couponValue) => {
  if (!merchantId) throw new Error('Merchant ID is required')
  if (!couponValue) throw new Error('Coupon value is required')
  const response = await api.get(`/merchant/${merchantId}/events/by-coupon`, {
    headers: { __couponValue: couponValue },
  })
  return response.data
}

const selfServiceService = {
  fetchEventByCoupon,
}

export default selfServiceService
