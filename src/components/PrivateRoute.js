import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import authService from 'src/services/auth'

const PrivateRoute = () => {
  const user = authService.getCurrentUser()
  return user ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoute
