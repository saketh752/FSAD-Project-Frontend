import React, { useState } from 'react'
import './Teacher.css'
import { useAuth } from '../context/AuthContext'
import { teacherService } from '../api/teacherService'

const TeacherProfile = () => {
  const { currentUser, updateCurrentUser } = useAuth()
  const teacher = currentUser

  const [formData, setFormData] = useState({
    id: teacher?.id || '',
    contact: teacher?.contact || '',
    designation: teacher?.designation || '',
    department: teacher?.department || '',
    password: ''
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
      const updatedTeacher = await teacherService.updateProfile({
        id: teacher.id,
        contact: formData.contact,
        designation: formData.designation,
        department: formData.department,
        password: formData.password,
      })
      setMessage('Profile updated successfully.')
      setError('')
      updateCurrentUser(updatedTeacher)
      setFormData((currentData) => ({
        ...currentData,
        password: '',
        contact: updatedTeacher.contact ?? currentData.contact,
        designation: updatedTeacher.designation ?? currentData.designation,
        department: updatedTeacher.department ?? currentData.department,
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
      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>My Profile</h2>
          <p>Your personal information and details</p>
        </div>
        <div className="teacher-profile-grid">
          <div className="teacher-info-item">
            <span className="teacher-info-label">Full Name</span>
            <span className="teacher-info-value">{teacher?.name || '-'}</span>
          </div>
          <div className="teacher-info-item">
            <span className="teacher-info-label">Email</span>
            <span className="teacher-info-value">{teacher?.email || '-'}</span>
          </div>
          <div className="teacher-info-item">
            <span className="teacher-info-label">Username</span>
            <span className="teacher-info-value">{teacher?.username || '-'}</span>
          </div>
          <div className="teacher-info-item">
            <span className="teacher-info-label">Department</span>
            <span className="teacher-info-value">{teacher?.department || '-'}</span>
          </div>
          <div className="teacher-info-item">
            <span className="teacher-info-label">Designation</span>
            <span className="teacher-info-value">{teacher?.designation || '-'}</span>
          </div>
          <div className="teacher-info-item">
            <span className="teacher-info-label">Contact</span>
            <span className="teacher-info-value">{teacher?.contact || '-'}</span>
          </div>
        </div>
      </div>

      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>Update Profile</h2>
          <p>You can update your contact, designation, department and password</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="teacher-form-grid">
            <div className="teacher-form-item">
              <label className="teacher-form-label">Contact Number</label>
              <input type="text" name="contact" placeholder="Enter new contact" value={formData.contact} onChange={handleChange} required maxLength={50} />
            </div>
            <div className="teacher-form-item">
              <label className="teacher-form-label">Designation</label>
              <select name="designation" value={formData.designation} onChange={handleChange} required>
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="HOD">HOD</option>
              </select>
            </div>
            <div className="teacher-form-item">
              <label className="teacher-form-label">Department</label>
              <select name="department" value={formData.department} onChange={handleChange} required>
                <option value="">Select Department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </div>
            <div className="teacher-form-item">
              <label className="teacher-form-label">New Password</label>
              <input type="password" name="password" placeholder="Enter new password" value={formData.password} onChange={handleChange} required maxLength={50} />
            </div>
            <button type="submit" className="teacher-primary-btn" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
        {message && <div className="teacher-success">{message}</div>}
        {error && <div className="teacher-error">{error}</div>}
      </div>
    </div>
  )
}

export default TeacherProfile
