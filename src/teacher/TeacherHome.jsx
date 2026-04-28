import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './Teacher.css'
import { useAuth } from '../context/AuthContext'

const TeacherHome = () => {
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
        const response = await axiosClient.get('/teacher/viewsubjects', { params: { department: currentUser.department } })

        const subjects = Array.isArray(response.data) ? response.data : []

        const projectResponses = await Promise.all(
          subjects.map((subject) =>
            axiosClient.get('/teacher/projects', { params: { coursecode: subject.coursecode } })
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
        console.error('Error loading teacher dashboard stats:', error)
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
      <div className="teacher-welcome-card">
        <div>
          <h2>Welcome back, {currentUser?.name || 'Teacher'}</h2>
          <p>Manage your profile and oversee student project submissions</p>
        </div>
        <span className="teacher-welcome-badge">Faculty</span>
      </div>

      <div className="teacher-stats-grid">
        <div className="teacher-stat-card">
          <span className="teacher-stat-label">Projects Assigned</span>
          <span className="teacher-stat-value">
            {loadingStats ? '...' : dashboardStats.totalProjects}
          </span>
          <span className="teacher-stat-sub">
            {loadingStats ? 'Loading projects' : `${dashboardStats.activeProjects} active projects`}
          </span>
        </div>
        <div className="teacher-stat-card">
          <span className="teacher-stat-label">Active Projects</span>
          <span className="teacher-stat-value">
            {loadingStats ? '...' : dashboardStats.activeProjects}
          </span>
          <span className="teacher-stat-sub">Open by deadline</span>
        </div>
        <div className="teacher-stat-card">
          <span className="teacher-stat-label">Completed</span>
          <span className="teacher-stat-value">
            {loadingStats ? '...' : Math.max(dashboardStats.totalProjects - dashboardStats.activeProjects, 0)}
          </span>
          <span className="teacher-stat-sub">Past deadline</span>
        </div>
        <div className="teacher-stat-card">
          <span className="teacher-stat-label">Status</span>
          <span className="teacher-stat-value">0</span>
          <span className="teacher-stat-sub">Live project sync enabled</span>
        </div>
      </div>

      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>Quick Actions</h2>
          <p>Jump straight to what you need</p>
        </div>
        <Link to="/teacher/profile">
          <button className="teacher-primary-btn" style={{ maxWidth: '200px' }}>
            View Profile
          </button>
        </Link>
      </div>
    </div>
  )
}

export default TeacherHome
