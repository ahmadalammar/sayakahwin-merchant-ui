import axios from 'axios'
import authService from './auth'
import config from 'src/config'

const api = axios.create({
  baseURL: config.API_BASE_URL,
})

// Module-level coupon auth state.
// When set, requests will send an X-Coupon-Value header instead of the
// merchant Bearer token. This is used by the public self-service flow where
// a guest claims a coupon to create/update an event.
let activeCouponValue = null

export const setCouponAuth = (value) => {
  activeCouponValue = value || null
}

export const clearCouponAuth = () => {
  activeCouponValue = null
}

export const getCouponAuth = () => activeCouponValue

api.interceptors.request.use(
  (requestConfig) => {
    // Per-request opt-out flag for endpoints that should never carry auth
    const skipAuth = requestConfig?.headers?.__skipAuth === true
    if (skipAuth) {
      delete requestConfig.headers.__skipAuth
      return requestConfig
    }

    // Per-request coupon override (takes precedence over global state)
    const requestCoupon = requestConfig?.headers?.__couponValue
    if (requestCoupon) {
      delete requestConfig.headers.__couponValue
      requestConfig.headers['X-Coupon-Value'] = requestCoupon
      return requestConfig
    }

    // Global coupon mode: use coupon header instead of Bearer token
    if (activeCouponValue) {
      requestConfig.headers['X-Coupon-Value'] = activeCouponValue
      return requestConfig
    }

    // Default: merchant Bearer token
    const user = authService.getCurrentUser()
    if (user && user.token) {
      requestConfig.headers['Authorization'] = 'Bearer ' + user.token
    }
    return requestConfig
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not auto-logout when running in coupon (self-service) mode —
      // a 401 there just means the coupon is invalid/expired.
      if (!activeCouponValue) {
        authService.logout()
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
