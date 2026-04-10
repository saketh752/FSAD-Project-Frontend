import React, { useEffect, useState } from 'react'
import './Admin.css'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../api/adminService'

const formatTimestamp = (value) => {
  if (!value) {
    return 'Just now'
  }

  const date = new Date(value)

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const roleLabels = {
  admin: 'Admin',
  student: 'Student',
  teacher: 'Teacher',
}

const AdminHome = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    blockedAccounts: 0,
    activeStudents: 0,
    activeTeachers: 0,
    totalTrackedEvents: 0,
    activeSessions: [],
    recentActivities: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { currentUser } = useAuth()

  const loadDashboard = async () => {
    try {
      const snapshot = await adminService.getDashboardSnapshot()
      setDashboardData(snapshot)
      setError('')
    } catch (serviceError) {
      setError(serviceError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()

    const pollTimer = window.setInterval(loadDashboard, 4000)
    const handleStorageUpdate = () => loadDashboard()

    window.addEventListener('storage', handleStorageUpdate)
    window.addEventListener('portal-monitor-updated', handleStorageUpdate)

    return () => {
      window.clearInterval(pollTimer)
      window.removeEventListener('storage', handleStorageUpdate)
      window.removeEventListener('portal-monitor-updated', handleStorageUpdate)
    }
  }, [])

  return (
    <div>
      <div className="admin-welcome-card">
        <div>
          <h2>Welcome back, {currentUser?.username || 'Admin'}</h2>
          <p>Here is an overview of the Group Project Portal</p>
        </div>
        <span className="admin-welcome-badge">Administrator</span>
      </div>

      {loading ? (
        <p className="admin-loading">Loading dashboard...</p>
      ) : (
        <>
          {error && <div className="admin-error">{error}</div>}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span className="admin-stat-label">Total Students</span>
              <span className="admin-stat-value">{dashboardData.totalStudents}</span>
              <span className="admin-stat-sub">Registered student accounts</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Total Teachers</span>
              <span className="admin-stat-value">{dashboardData.totalTeachers}</span>
              <span className="admin-stat-sub">Registered teacher accounts</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Blocked Accounts</span>
              <span className="admin-stat-value">{dashboardData.blockedAccounts}</span>
              <span className="admin-stat-sub">Accounts blocked by admin</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Active Students</span>
              <span className="admin-stat-value">{dashboardData.activeStudents}</span>
              <span className="admin-stat-sub">Students active in the last 15 minutes</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Active Teachers</span>
              <span className="admin-stat-value">{dashboardData.activeTeachers}</span>
              <span className="admin-stat-sub">Teachers active in the last 15 minutes</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">Tracked Events</span>
              <span className="admin-stat-value">{dashboardData.totalTrackedEvents}</span>
              <span className="admin-stat-sub">Student and teacher actions recorded for admin review</span>
            </div>
          </div>

          <div className="admin-monitor-grid">
            <section className="admin-section-card">
              <div className="admin-section-header">
                <h2>Live Portal Monitor</h2>
                <p>Currently active student and teacher sessions</p>
              </div>

              {dashboardData.activeSessions.length === 0 ? (
                <p className="admin-empty-state">No active student or teacher sessions right now.</p>
              ) : (
                <div className="admin-session-grid">
                  {dashboardData.activeSessions.map((session) => (
                    <div key={session.sessionKey} className="admin-session-card">
                      <div className="admin-session-top">
                        <span className={`admin-role-chip admin-role-chip-${session.role}`}>
                          {roleLabels[session.role] || session.role}
                        </span>
                        <span className="admin-session-time">
                          Last active {formatTimestamp(session.lastActiveAt)}
                        </span>
                      </div>
                      <h3>{session.userName}</h3>
                      <p>{session.email || 'No email available'}</p>
                      <div className="admin-session-meta">
                        <span>{session.currentPage || 'Workspace'}</span>
                        <span>{session.department || 'General access'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-section-card">
              <div className="admin-section-header">
                <h2>Recent Activity Feed</h2>
                <p>Latest actions happening across student and teacher portals</p>
              </div>

              {dashboardData.recentActivities.length === 0 ? (
                <p className="admin-empty-state">No tracked activity yet. It will appear here as users interact.</p>
              ) : (
                <div className="admin-activity-list">
                  {dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="admin-activity-item">
                      <div className="admin-activity-top">
                        <span className={`admin-role-chip admin-role-chip-${activity.actorRole}`}>
                          {roleLabels[activity.actorRole] || activity.actorRole}
                        </span>
                        <span className="admin-activity-time">{formatTimestamp(activity.createdAt)}</span>
                      </div>
                      <h3>{activity.action}</h3>
                      <p>{activity.description}</p>
                      <span className="admin-activity-user">{activity.actorName}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminHome
