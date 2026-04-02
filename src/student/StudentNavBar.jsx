import React from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './Student.css'
import StudentHome from './StudentHome'
import StudentProfile from './StudentProfile'
import PageNotFound from '../pages/PageNotFound'
import { useAuth } from '../context/AuthContext'

const StudentNavBar = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="student-layout">
      <nav className="student-navbar">
        <div className="student-brand">Group Project Portal</div>
        <ul className="student-nav-links">
          <li><Link to="/student/home">Home</Link></li>
          <li><Link to="/student/profile">Profile</Link></li>
          <li><button type="button" onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>
      <main className="student-page-wrap">
        <Routes>
          <Route path="/" element={<Navigate to="/student/home" replace />} />
          <Route path="/student/home" element={<StudentHome />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default StudentNavBar