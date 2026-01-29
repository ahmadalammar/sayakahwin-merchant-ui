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

const merchantService = {
  getSubscription,
  getLicense,
  getTransactionHistory,
  getDashboardData,
}

export default merchantService
