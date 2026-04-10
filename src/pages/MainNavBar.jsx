import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import './Style.css'

const MainNavBar = () => {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Group Project Submission Portal</div>
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/adminlogin">Admin</Link></li>
          <li><Link to="/studentlogin">Student</Link></li>
          <li><Link to="/teacherlogin">Teacher</Link></li>
        </ul>
      </nav>
      <Outlet />
    </>
  )
}

export default MainNavBar
