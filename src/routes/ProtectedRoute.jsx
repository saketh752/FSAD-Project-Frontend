import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const homeRoutes = {
  admin: '/admin/home',
  student: '/student/home',
  teacher: '/teacher/home',
}

const ProtectedRoute = ({ allowedRole }) => {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={homeRoutes[role] || '/'} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
