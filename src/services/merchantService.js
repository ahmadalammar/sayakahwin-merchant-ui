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
  getDashboardData,
}

export default merchantService
