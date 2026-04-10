import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Style.css'
import { useAuth } from '../context/AuthContext'
import { adminAuthService } from '../api/authService'

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { loginAs } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const adminUser = await adminAuthService.signIn(formData)
      loginAs('admin', adminUser)
      navigate('/admin/home')
    } catch (serviceError) {
      setError(serviceError.message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page-body">
        <div className="login-card login-card-admin">
          <h2 className="login-title">Admin Login</h2>
          <p className="login-subtitle">Restricted access for the administrator account only</p>
          {error && <div className="form-message form-message-error">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Admin Email</label>
              <input type="email" name="email" placeholder="Enter admin email" value={formData.email} onChange={e => setFormData({...formData, [e.target.name]: e.target.value})} required maxLength={100} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Enter password" value={formData.password} onChange={e => setFormData({...formData, [e.target.name]: e.target.value})} required maxLength={50} />
            </div>
            <button type="submit" className="login-btn">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
