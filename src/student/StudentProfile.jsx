import React, { useState } from 'react'
import './Student.css'
import { useAuth } from '../context/AuthContext'
import { studentService } from '../api/studentService'

const StudentProfile = () => {
  const { currentUser, updateCurrentUser } = useAuth()
  const student = currentUser

  const [formData, setFormData] = useState({
    id: student?.id || '',
    contact: student?.contact || '',
    bloodgroup: student?.bloodGroup || student?.bloodgroup || '',
    password: '',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const updatedStudent = await studentService.updateProfile({
        id: student.id,
        contact: formData.contact,
        bloodGroup: formData.bloodgroup,
        password: formData.password,
      })
      setMessage('Profile updated successfully.')
      setError('')
      updateCurrentUser(updatedStudent)
      setFormData((currentData) => ({
        ...currentData,
        password: '',
        contact: updatedStudent.contact ?? currentData.contact,
        bloodgroup: updatedStudent.bloodGroup ?? currentData.bloodgroup,
      }))
    } catch (serviceError) {
      setMessage('')
      setError(serviceError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="student-section-card">
        <div className="student-section-header">
          <h2>My Profile</h2>
          <p>Your personal information and details</p>
        </div>
        <div className="student-profile-grid">
          <div className="student-info-item">
            <span className="student-info-label">Full Name</span>
            <span className="student-info-value">{student?.name || '-'}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Email</span>
            <span className="student-info-value">{student?.email || '-'}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Username</span>
            <span className="student-info-value">{student?.username || '-'}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Department</span>
            <span className="student-info-value">{student?.department || '-'}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Gender</span>
            <span className="student-info-value">{student?.gender || '-'}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Contact</span>
            <span className="student-info-value">{student?.contact || '-'}</span>
          </div>
          <div className="student-info-item">
            <span className="student-info-label">Blood Group</span>
            <span className="student-info-value">{student?.bloodGroup || student?.bloodgroup || '-'}</span>
          </div>
        </div>
      </div>

      <div className="student-section-card">
        <div className="student-section-header">
          <h2>Update Profile</h2>
          <p>You can update your contact, blood group and password</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="student-form-grid">
            <div className="student-form-item">
              <label className="student-form-label">Contact Number</label>
              <input type="text" name="contact" placeholder="Enter new contact" value={formData.contact} onChange={handleChange} required maxLength={20} />
            </div>
            <div className="student-form-item">
              <label className="student-form-label">Blood Group</label>
              <input type="text" name="bloodgroup" placeholder="Enter blood group" value={formData.bloodgroup} onChange={handleChange} required maxLength={5} />
            </div>
            <div className="student-form-item">
              <label className="student-form-label">New Password</label>
              <input type="password" name="password" placeholder="Enter new password" value={formData.password} onChange={handleChange} required maxLength={50} />
            </div>
            <button type="submit" className="student-primary-btn" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
        {message && <div className="student-success">{message}</div>}
        {error && <div className="student-error">{error}</div>}
      </div>
    </div>
  )
}

export default StudentProfile
