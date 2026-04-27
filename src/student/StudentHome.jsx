import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Student.css'
import { useAuth } from '../context/AuthContext'

const StudentHome = () => {
  const { currentUser } = useAuth()
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    let isMounted = true

    const isActiveProject = (project) => {
      if (!project?.deadline) {
        return true
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const deadline = new Date(project.deadline)
      deadline.setHours(0, 0, 0, 0)

      return !Number.isNaN(deadline.getTime()) && deadline >= today
    }

    const fetchDashboardStats = async () => {
      if (!currentUser?.department) {
        if (isMounted) {
          setDashboardStats({ totalProjects: 0, activeProjects: 0 })
          setLoadingStats(false)
        }
        return
      }

      try {
        const subjectsRes = await axios.get(
          `http://localhost:8080/api/student/subjects?department=${currentUser.department}`
        )

        const subjects = Array.isArray(subjectsRes.data) ? subjectsRes.data : []

        const projectResponses = await Promise.all(
          subjects.map((subject) =>
            axios.get(`http://localhost:8080/api/teacher/projects?coursecode=${subject.coursecode}`)
          )
        )

        const projects = projectResponses.flatMap((response) =>
          Array.isArray(response.data) ? response.data : []
        )

        const activeProjects = projects.filter(isActiveProject).length

        if (isMounted) {
          setDashboardStats({
            totalProjects: projects.length,
            activeProjects,
          })
        }
      } catch (error) {
        console.error('Error loading student dashboard stats:', error)
        if (isMounted) {
          setDashboardStats({ totalProjects: 0, activeProjects: 0 })
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false)
        }
      }
    }

    fetchDashboardStats()
    const intervalId = setInterval(fetchDashboardStats, 30000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [currentUser])

  return (
    <div>
      <div className="student-welcome-card">
        <div>
          <h2>Welcome back, {currentUser?.name || 'Student'}</h2>
          <p>Manage your profile and track your project submissions</p>
        </div>
        <span className="student-welcome-badge">Student</span>
      </div>

      <div className="student-stats-grid">
        <div className="student-stat-card">
          <span className="student-stat-label">Projects Assigned</span>
          <span className="student-stat-value">
            {loadingStats ? '...' : dashboardStats.totalProjects}
          </span>
          <span className="student-stat-sub">
            {loadingStats ? 'Loading projects' : `${dashboardStats.activeProjects} active projects`}
          </span>
        </div>
        <div className="student-stat-card">
          <span className="student-stat-label">Active Projects</span>
          <span className="student-stat-value">
            {loadingStats ? '...' : dashboardStats.activeProjects}
          </span>
          <span className="student-stat-sub">Open by deadline</span>
        </div>
        <div className="student-stat-card">
          <span className="student-stat-label">Completed</span>
          <span className="student-stat-value">
            {loadingStats ? '...' : Math.max(dashboardStats.totalProjects - dashboardStats.activeProjects, 0)}
          </span>
          <span className="student-stat-sub">Past deadline</span>
        </div>
        <div className="student-stat-card">
          <span className="student-stat-label">Status</span>
          <span className="student-stat-value">0</span>
          <span className="student-stat-sub">Live project sync enabled</span>
        </div>
      </div>

      <div className="student-section-card">
        <div className="student-section-header">
          <h2>Quick Actions</h2>
          <p>Jump straight to what you need</p>
        </div>
        <Link to="/student/profile">
          <button className="student-primary-btn" style={{ maxWidth: '200px' }}>
            View Profile
          </button>
        </Link>
      </div>
    </div>
  )
}

export default StudentHome
