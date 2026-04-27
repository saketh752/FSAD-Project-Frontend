import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './Student.css'

const ViewSubjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const student = currentUser

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!student) {
        setError('Please log in to view subjects')
        setLoading(false)
        return
      }

      if (!student.department) {
        setError('Unable to load subjects: Department information missing')
        setLoading(false)
        return
      }

      try {
        const res = await axios.get(
          `http://localhost:8080/api/student/subjects?department=${student.department}`
        )

        console.log("API Response:", res.data)
        setSubjects(Array.isArray(res.data) ? res.data : [])
        setError('')

      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.response?.data || 'Error fetching subjects')
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }

    if (student?.department) {
      fetchSubjects()
    }
  }, [student])

  return (
    <div className="student-page">
      <div className="student-section-card">
        <div className="student-section-header">
          <h2>My Subjects</h2>
          <p>Click on a subject to view projects and collaborate with your team</p>
        </div>

        {error && <div className="student-error">{error}</div>}

        {loading ? (
          <div className="student-loading-container">
            <div className="student-spinner"></div>
            <p className="student-loading">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="student-empty-state">
            <div className="student-empty-icon">📚</div>
            <p className="student-empty-text">No subjects found for your department</p>
          </div>
        ) : (
          <div className="student-subject-grid">
            {subjects.map((s, index) => (
              <div
                key={s.id || s.coursecode || index}
                className="student-subject-card"
                onClick={() => navigate(`/student/subjectprojects/${s.coursecode}`)}
                role="button"
                tabIndex={0}
              >
                <div className="student-subject-card-header">
                  <span className="student-subject-code">{s.coursecode}</span>
                </div>
                
                <h3 className="student-subject-name">{s.subjectname}</h3>
                
                <div className="student-subject-details">
                  <span className="student-subject-info">
                    <span className="info-label">Semester:</span> {s.semester}
                  </span>
                  <span className="student-subject-info">
                    <span className="info-label">Credits:</span> {s.credits}
                  </span>
                </div>

                {s.description && (
                  <p className="student-subject-desc">{s.description}</p>
                )}

                <div className="student-subject-footer">
                  <span className="student-subject-view">View Projects →</span>
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