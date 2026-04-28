import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './Teacher.css'
import { useAuth } from '../context/AuthContext'

const ViewSubjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const teacher = currentUser

  useEffect(() => {
    const fetchSubjects = async () => {

      if (!teacher || !teacher.department) {
        setLoading(false)
        return
      }

      try {
        const response = await axiosClient.get('/teacher/viewsubjects', { params: { department: teacher.department } })

        console.log("API Response:", response.data)

        // ✅ FORCE ARRAY
        if (Array.isArray(response.data)) {
          setSubjects(response.data)
        } else {
          setSubjects([])
        }

      } catch (err) {
        console.error(err)
        setError('Error fetching subjects')
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()

  }, [teacher])

  return (
    <div className="teacher-page">

      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>My Subjects</h2>
          <p>Click on a subject to view projects</p>
        </div>

        {/* ERROR */}
        {error && <div className="teacher-error">{error}</div>}

        {/* LOADING */}
        {loading ? (
          <p className="teacher-loading">Loading subjects...</p>

        ) : subjects.length === 0 ? (

          // EMPTY STATE
          <p className="teacher-loading">No subjects found for your department</p>

        ) : (

          // ✅ SUBJECT LIST
          <div className="teacher-subject-grid">
            {subjects.map((s, index) => (
              <div
                key={s.id || index}
                className="teacher-subject-card"
                onClick={() => navigate(`/teacher/subjectprojects/${s.coursecode}`)}
              >

                <div className="teacher-subject-card-header">
                  <span className="teacher-subject-code">
                    {s.coursecode}
                  </span>
                </div>

                <span className="teacher-subject-name">
                  {s.subjectname}
                </span>

                <div className="teacher-subject-details">
                  <span className="teacher-subject-info">
                    Semester: {s.semester}
                  </span>
                  <span className="teacher-subject-info">
                    Credits: {s.credits}
                  </span>
                </div>

                {s.description && (
                  <span className="teacher-subject-desc">
                    {s.description}
                  </span>
                )}

                <span className="teacher-subject-view">
                  View Projects →
                </span>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default ViewSubjects