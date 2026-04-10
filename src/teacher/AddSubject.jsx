import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Teacher.css'

const AddSubject = () => {
  const { currentUser: teacher } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    coursecode: '',
    subjectname: '',
    semester: '',
    credits: '',
    description: ''
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!teacher || !teacher.id) {
      setError("Teacher not found. Please login again.")
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(
        `http://localhost:8080/api/teacher/addsubject?teacherId=${teacher.id}`,
        formData
      )

      console.log("Response:", response.data)

      // ✅ FIX: Use string instead of object
      setMessage(`Subject "${response.data.subjectname}" added successfully!`)
      setError('')

      // Reset form
      setFormData({
        coursecode: '',
        subjectname: '',
        semester: '',
        credits: '',
        description: ''
      })

      // ✅ Redirect after 1.5 sec
      setTimeout(() => {
        navigate('/teacher/viewsubjects')
      }, 1500)

    } catch (err) {
      console.error(err)
      setError('Error adding subject')
      setMessage('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>Add New Subject</h2>
          <p>Add a subject you will be teaching</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="teacher-form-grid">

            <div className="teacher-form-item">
              <label className="teacher-form-label">Course Code</label>
              <input
                type="text"
                name="coursecode"
                placeholder="e.g., CSE101"
                value={formData.coursecode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="teacher-form-item">
              <label className="teacher-form-label">Subject Name</label>
              <input
                type="text"
                name="subjectname"
                placeholder="e.g., Data Structures"
                value={formData.subjectname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="teacher-form-item">
              <label className="teacher-form-label">Semester</label>
              <input
                type="text"
                name="semester"
                placeholder="e.g., 3"
                value={formData.semester}
                onChange={handleChange}
                required
              />
            </div>

            <div className="teacher-form-item">
              <label className="teacher-form-label">Credits</label>
              <input
                type="number"
                name="credits"
                placeholder="e.g., 4"
                value={formData.credits}
                onChange={handleChange}
                required
              />
            </div>

            <div className="teacher-form-item" style={{ gridColumn: '1 / -1' }}>
              <label className="teacher-form-label">Description</label>
              <textarea
                name="description"
                placeholder="Enter subject description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              className="teacher-primary-btn"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Subject"}
            </button>

          </div>
        </form>

        {/* ✅ SUCCESS MESSAGE */}
        {message && <div className="teacher-success">{message}</div>}

        {/* ✅ ERROR MESSAGE */}
        {error && <div className="teacher-error">{error}</div>}

      </div>
    </div>
  )
}

export default AddSubject