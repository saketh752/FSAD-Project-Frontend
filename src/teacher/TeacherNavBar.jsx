import React, { useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import './Teacher.css'
import { useAuth } from '../context/AuthContext'
import { teacherService } from '../api/teacherService'

const TeacherNavBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, currentUser } = useAuth()

  useEffect(() => {
    if (currentUser) {
      teacherService.trackPortalVisit(currentUser, location.pathname)
    }
  }, [currentUser, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="teacher-layout">
      <nav className="teacher-navbar">
        <div className="teacher-brand">Group Project Portal</div>
        <ul className="teacher-nav-links">
          <li><Link to="/teacher/home">Home</Link></li>
          <li><Link to="/teacher/profile">Profile</Link></li>
          <li><Link to="/teacher/viewsubjects">Subjects</Link></li>
          <li><Link to="/teacher/addsubject">Add Subject</Link></li>
          <li><button type="button" onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>
      <main className="teacher-page-wrap">
        <Outlet />
      </main>
    </div>
  )
}

export default TeacherNavBar
