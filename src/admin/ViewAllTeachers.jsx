import React, { useEffect, useMemo, useState } from 'react'
import './Admin.css'
import { adminService } from '../api/adminService'

const ViewAllTeachers = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchTeachers = async () => {
    setLoading(true)

    try {
      const data = await adminService.getTeachers()
      setTeachers(Array.isArray(data) ? data : [])
      setError('')
    } catch (serviceError) {
      setError(serviceError.message)
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const data = await adminService.getTeachers()
      setTeachers(Array.isArray(data) ? data : [])
      setMessage('Data refreshed successfully')
      setTimeout(() => setMessage(''), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => { 
    fetchTeachers()
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchTeachers, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredTeachers = useMemo(() => (
    teachers.filter((teacher) => {
      const query = searchTerm.trim().toLowerCase()

      if (!query) {
        return true
      }

      return [
        teacher.name,
        teacher.email,
        teacher.department,
        teacher.username,
        teacher.status,
      ].some((value) => value?.toLowerCase().includes(query))
    })
  ), [searchTerm, teachers])

  const handleToggleStatus = async (teacher) => {
    const nextStatus = teacher.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'

    try {
      await adminService.updateTeacherStatus(teacher.id, nextStatus)
      setMessage(
        nextStatus === 'BLOCKED'
          ? `Teacher account for ${teacher.name} has been blocked.`
          : `Teacher account for ${teacher.name} has been restored.`,
      )
      setError('')
      fetchTeachers()
    } catch (serviceError) {
      setError(serviceError.message)
    }
  }

  const handleDelete = async (teacher) => {
    const confirmed = window.confirm(`Delete ${teacher.name}'s account permanently?`)

    if (!confirmed) {
      return
    }

    try {
      await adminService.deleteTeacher(teacher.id)
      setMessage(`Teacher account for ${teacher.name} was deleted permanently.`)
      setError('')
      fetchTeachers()
    } catch (serviceError) {
      setError(serviceError.message)
    }
  }

  return (
    <div className="admin-section-card">
      <div className="admin-section-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>All Teachers</h2>
            <p>View and manage all registered teachers</p>
          </div>
          <button 
            className="admin-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.6 : 1,
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Now'}
          </button>
        </div>
      </div>
      <div className="admin-search-row">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search teachers by name, email, or department"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search teachers"
        />
      </div>
      {message && <div className="admin-success">{message}</div>}
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p className="admin-loading">Loading teachers...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Username</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No teachers found</td></tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.name}</td>
                    <td>{t.department}</td>
                    <td>{t.username}</td>
                    <td>{t.email}</td>
                    <td>{t.contact}</td>
                    <td>{t.designation}</td>
                    <td>
                      <span className={`admin-status-badge ${t.status === 'BLOCKED' ? 'admin-status-badge-blocked' : 'admin-status-badge-active'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-secondary-btn" onClick={() => handleToggleStatus(t)}>
                          {t.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                        </button>
                        <button className="admin-danger-btn" onClick={() => handleDelete(t)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ViewAllTeachers
