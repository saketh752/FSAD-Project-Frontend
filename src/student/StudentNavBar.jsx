import React, { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import './Student.css'
import { useAuth } from '../context/AuthContext'
import { studentService } from '../api/studentService'

const StudentNavBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, currentUser } = useAuth()

  useEffect(() => {
    if (currentUser) {
      studentService.trackPortalVisit(currentUser, location.pathname)
    }
  }, [currentUser, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="student-layout">
      <nav className="student-navbar">
        <div className="student-brand">Group Project Submissions Portal</div>
        <ul className="student-nav-links">
          <li><Link to="/student/home">Home</Link></li>
          <li><Link to="/student/profile">Profile</Link></li>
          <li><Link to="/student/viewsubjects">Subjects</Link></li>
          <li><button type="button" onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>
      <main className="student-page-wrap">
        <Outlet />
      </main>
    </div>
  )
}

export default StudentNavBar
