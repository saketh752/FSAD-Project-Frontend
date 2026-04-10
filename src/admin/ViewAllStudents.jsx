import React, { useEffect, useMemo, useState } from 'react'
import './Admin.css'
import { adminService } from '../api/adminService'

const ViewAllStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchStudents = async () => {
    setLoading(true)

    try {
      const data = await adminService.getStudents()
      setStudents(data)
      setError('')
    } catch (serviceError) {
      setError(serviceError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStudents() }, [])

  const filteredStudents = useMemo(() => (
    students.filter((student) => {
      const query = searchTerm.trim().toLowerCase()

      if (!query) {
        return true
      }

      return [
        student.name,
        student.email,
        student.department,
        student.username,
        student.status,
      ].some((value) => value?.toLowerCase().includes(query))
    })
  ), [searchTerm, students])

  const handleToggleStatus = async (student) => {
    const nextStatus = student.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'

    try {
      await adminService.updateStudentStatus(student.id, nextStatus)
      setMessage(
        nextStatus === 'BLOCKED'
          ? `Student account for ${student.name} has been blocked.`
          : `Student account for ${student.name} has been restored.`,
      )
      setError('')
      fetchStudents()
    } catch (serviceError) {
      setError(serviceError.message)
    }
  }

  const handleDelete = async (student) => {
    const confirmed = window.confirm(`Delete ${student.name}'s account permanently?`)

    if (!confirmed) {
      return
    }

    try {
      await adminService.deleteStudent(student.id)
      setMessage(`Student account for ${student.name} was deleted permanently.`)
      setError('')
      fetchStudents()
    } catch (serviceError) {
      setError(serviceError.message)
    }
  }

  return (
    <div className="admin-section-card">
      <div className="admin-section-header">
        <h2>All Students</h2>
        <p>View and manage all registered students</p>
      </div>
      <div className="admin-search-row">
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search students by name, email, or department"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search students"
        />
      </div>
      {message && <div className="admin-success">{message}</div>}
      {error && <div className="admin-error">{error}</div>}
      {loading ? (
        <p className="admin-loading">Loading students...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Username</th>
                <th>Department</th>
                <th>Blood Group</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No students found</td></tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>{s.gender}</td>
                    <td>{s.email}</td>
                    <td>{s.contact}</td>
                    <td>{s.username}</td>
                    <td>{s.department}</td>
                    <td>{s.bloodGroup}</td>
                    <td>
                      <span className={`admin-status-badge ${s.status === 'BLOCKED' ? 'admin-status-badge-blocked' : 'admin-status-badge-active'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-secondary-btn" onClick={() => handleToggleStatus(s)}>
                          {s.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                        </button>
                        <button className="admin-danger-btn" onClick={() => handleDelete(s)}>Delete</button>
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

export default ViewAllStudents
