import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const homeRoutes = {
  admin: '/admin/home',
  student: '/student/home',
  teacher: '/teacher/home',
}

const PublicOnlyRoute = () => {
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={homeRoutes[role] || '/'} replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
