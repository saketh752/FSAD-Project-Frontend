import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Style.css'
import { useAuth } from '../context/AuthContext'
import { studentAuthService } from '../api/authService'

const initialLoginForm = {
  username: '',
  password: '',
}

const initialRegisterForm = {
  name: '',
  gender: '',
  email: '',
  contact: '',
  username: '',
  password: '',
  department: '',
  bloodgroup: '',
}

const StudentLogin = () => {
  const [mode, setMode] = useState('login')
  const [loginFormData, setLoginFormData] = useState(initialLoginForm)
  const [registerFormData, setRegisterFormData] = useState(initialRegisterForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { loginAs } = useAuth()

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      const studentUser = await studentAuthService.signIn(loginFormData)
      loginAs('student', studentUser)
      navigate('/student/home')
    } catch (serviceError) {
      setError(serviceError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')

    try {
      await studentAuthService.register({
        ...registerFormData,
        bloodGroup: registerFormData.bloodgroup,
      })
      setRegisterFormData(initialRegisterForm)
      setLoginFormData((currentData) => ({
        ...currentData,
        username: registerFormData.username,
      }))
      setMode('login')
      setMessage('Student account created. You can sign in now.')
    } catch (serviceError) {
      setError(serviceError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setMessage('')
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-page-body">
        <div className="login-card login-card-student register-card">
          <div className="auth-mode-toggle">
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'login' ? 'auth-mode-btn-active auth-mode-btn-student' : ''}`}
              onClick={() => switchMode('login')}
            >
              Student Sign In
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'register' ? 'auth-mode-btn-active auth-mode-btn-student' : ''}`}
              onClick={() => switchMode('register')}
            >
              Student Register
            </button>
          </div>

          <h2 className="login-title">{mode === 'login' ? 'Student Access' : 'Create Student Account'}</h2>
          <p className="login-subtitle">
            {mode === 'login'
              ? 'Use this panel to sign in to your student workspace.'
              : 'Register here, then use the same panel to sign in.'}
          </p>

          {message && <div className="form-message form-message-success">{message}</div>}
          {error && <div className="form-message form-message-error">{error}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={loginFormData.username}
                  onChange={(e) => setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value })}
                  required
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={loginFormData.password}
                  onChange={(e) => setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value })}
                  required
                  maxLength={50}
                />
              </div>
              <button type="submit" className="login-btn" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="login-form register-form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={registerFormData.name}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={registerFormData.gender}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value })}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={registerFormData.email}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Contact</label>
                <input
                  type="text"
                  name="contact"
                  placeholder="Enter contact number"
                  value={registerFormData.contact}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value })}
                  required
                  maxLength={20}
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={registerFormData.username}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value })}
                  required
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={registerFormData.password}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value })}
                  required
                  minLength={4}
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={registerFormData.department}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value })}
                  required
                >
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
                <select
                  name="bloodgroup"
                  value={registerFormData.bloodgroup}
                  onChange={(e) => setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value })}
                  required
                >
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
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentLogin
