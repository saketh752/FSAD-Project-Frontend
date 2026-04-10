import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Style.css'
import { registerStudentAccount } from '../services/accountService'

const initialFormData = {
  name: '',
  gender: '',
  email: '',
  contact: '',
  username: '',
  password: '',
  department: '',
  bloodgroup: '',
}

const StudentRegister = () => {
  const [formData, setFormData] = useState(initialFormData)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleChange = (event) => {
    setFormData((currentData) => ({
      ...currentData,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      registerStudentAccount(formData)
      setFormData(initialFormData)
      navigate('/studentlogin', {
        replace: true,
        state: { message: 'Student registration successful. Please sign in.' },
      })
    } catch (serviceError) {
      setError(serviceError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page-body">
        <div className="login-card login-card-student register-card">
          <h2 className="login-title">Student Registration</h2>
          <p className="login-subtitle">Create your student account to access the portal</p>
          {error && <div className="form-message form-message-error">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form register-form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} required maxLength={100} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="Enter email" value={formData.email} onChange={handleChange} required maxLength={100} />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input type="text" name="contact" placeholder="Enter contact number" value={formData.contact} onChange={handleChange} required maxLength={20} />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" placeholder="Choose a username" value={formData.username} onChange={handleChange} required maxLength={50} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required minLength={4} maxLength={50} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="department" value={formData.department} onChange={handleChange} required>
                <option value="">Select department</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodgroup" value={formData.bloodgroup} onChange={handleChange} required>
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create Student Account'}
            </button>
          </form>
          <p className="auth-switch-text">
            Already registered? <Link to="/studentlogin">Student login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default StudentRegister
