import axios from 'axios'
import authService from './auth'
import config from 'src/config'

const api = axios.create({
  baseURL: config.API_BASE_URL,
})

api.interceptors.request.use(
  (config) => {
    const user = authService.getCurrentUser()
    if (user && user.token) {
      console.log('user token', user.token)
      config.headers['Authorization'] = 'Bearer ' + user.token
    }
    return config
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
      authService.logout()
      window.location = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
