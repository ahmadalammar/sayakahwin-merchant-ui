import api from './api'
import authService from './auth'

const getSubscription = async () => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    return null
  }
  const { merchantId } = user
  const response = await api.get(`/merchant/${merchantId}/subscription`)
  return response.data
}

const getLicense = async () => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    return null
  }
  const { merchantId } = user
  const response = await api.get(`/merchant/${merchantId}/subscription`)
  return response.data
}

const getTransactionHistory = async () => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
  }
  const { merchantId } = user
  try {
    const response = await api.get(`/merchant/${merchantId}/transactions`)
    return response.data
  } catch (error) {
    // If transactions endpoint doesn't exist, return empty array
    console.warn('Transactions endpoint not available:', error.message)
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
  }
}

const getDashboardData = async () => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    return null
  }
  const { merchantId } = user
  const response = await api.get(`/merchant/${merchantId}/dashboard`)
  return response.data
}

const extractCouponsFromSubscription = (sub) => {
  if (!sub) return []
  if (Array.isArray(sub.coupons)) return sub.coupons
  if (Array.isArray(sub.coupon)) return sub.coupon
  if (Array.isArray(sub.history)) {
    return sub.history.filter(
      (h) => h && (h.transaction_type === 'coupon' || h.coupon_value),
    )
  }
  return []
}

const getCoupons = async () => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    return []
  }
  const { merchantId } = user
  const response = await api.get(`/merchant/${merchantId}/subscription`)
  return extractCouponsFromSubscription(response.data)
}

const createCoupon = async (amount = 1) => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    throw new Error('Not authenticated')
  }
  const { merchantId } = user
  const response = await api.post(`/merchant/${merchantId}/subscription/coupon`, { amount })
  return response.data
}

const merchantService = {
  getSubscription,
  getLicense,
  getTransactionHistory,
  getDashboardData,
  getCoupons,
  createCoupon,
  extractCouponsFromSubscription,
}

export default merchantService
