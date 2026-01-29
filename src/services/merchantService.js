import api from './api'
import authService from './auth'

const getSubscription = async () => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    throw new Error('User not authenticated or merchantId not found')
  }
  const { merchantId } = user
  const response = await api.get(`/merchant/${merchantId}/subscription`)
  return response.data
}

const getLicense = async () => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    throw new Error('User not authenticated or merchantId not found')
  }
  const { merchantId } = user
  const response = await api.get(`/merchant/${merchantId}/subscription`)
  return response.data
}

const getTransactionHistory = async () => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    throw new Error('User not authenticated or merchantId not found')
  }
  const { merchantId } = user
  try {
    const response = await api.get(`/merchant/${merchantId}/transactions`)
    return response.data
  } catch (error) {
    // If transactions endpoint doesn't exist, return empty array
    console.warn('Transactions endpoint not available:', error.message)
    return []
  }
}

const getDashboardData = async () => {
  const user = authService.getCurrentUser()
  if (!user || !user.merchantId) {
    throw new Error('User not authenticated or merchantId not found')
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
