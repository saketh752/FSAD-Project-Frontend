import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Admin.css'

const ViewSubjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/teacher/viewsubjects?department=CSE`
        )

        console.log("Admin Subjects:", response.data)

        if (Array.isArray(response.data)) {
          setSubjects(response.data)
        } else {
          setSubjects([])
        }

      } catch (err) {
        console.error(err)
        setError('Error fetching subjects')
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-section-card">
        <div className="admin-section-header">
          <h2>All Subjects</h2>
          <p>Manage and view all subjects across departments</p>
        </div>

        {error && (
          <div className="admin-error-alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        {loading ? (
          <div className="admin-loading-container">
            <div className="admin-spinner"></div>
            <p>Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="admin-empty-state">
            <div className="empty-icon">📚</div>
            <h3>No subjects found</h3>
            <p>No subjects available in the system</p>
          </div>
        ) : (
          <div className="admin-subject-grid">
            {(Array.isArray(subjects) ? subjects : []).map((s, index) => (
              <div key={index} className="admin-subject-card" style={{
                animationDelay: `${index * 0.08}s`
              }}>
                <div className="admin-subject-badge">Subject</div>
                <div className="admin-subject-header">
                  <h3 className="admin-subject-code">{s.coursecode}</h3>
                </div>
                <div className="admin-subject-content">
                  <p className="admin-subject-name">📝 {s.subjectname}</p>
                  <p className="admin-subject-semester">📊 Semester: {s.semester}</p>
                </div>
                <div className="admin-subject-footer">
                  <span className="admin-subject-tag">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewSubjects