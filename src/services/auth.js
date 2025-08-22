import api from './api'

const login = async (username, password) => {
  const response = await api.post('/auth/login', {
    username,
    password,
  })
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }
  return response.data
}

const loginWithGoogle = async (googleToken) => {
  const response = await api.post('/auth/google', {
    token: googleToken,
  })
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }
  return response.data
}

const logout = () => {
  localStorage.removeItem('user')
}

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'))
}

const authService = {
  login,
  loginWithGoogle,
  logout,
  getCurrentUser,
}

export default authService
