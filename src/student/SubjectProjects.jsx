import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './Student.css'

const SubjectProjects = () => {
  const { coursecode } = useParams()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axiosClient.get('/teacher/projects', {
          params: { coursecode },
        })
        setProjects(Array.isArray(response.data) ? response.data : [])
        setError('')
      } catch (err) {
        console.error(err)
        setError('Error fetching projects')
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [coursecode])

  return (
    <div className="student-page">
      <div className="student-section-card">
        <div className="student-section-header">
          <h2>Projects — {coursecode}</h2>
          <p>Select a project to view and join groups</p>
        </div>

        {error && <div className="student-error">{error}</div>}

        {loading ? (
          <div className="student-loading-container">
            <div className="student-spinner"></div>
            <p className="student-loading">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="student-empty-state">
            <div className="student-empty-icon">📋</div>
            <p className="student-empty-text">
              No projects available for this subject yet
            </p>
          </div>
        ) : (
          <div className="student-project-grid">
            {projects.map((p, index) => (
              <div
                key={p.id}
                className="student-project-card"
                onClick={() => navigate(`/student/projectgroups/${p.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="student-project-badge">
                  <span className="badge-text">Project {index + 1}</span>
                </div>

                <h3 className="student-project-title">{p.title}</h3>

                <p className="student-project-desc">{p.description}</p>

                <div className="student-project-meta">
                  <span className="project-deadline">
                    <span className="meta-icon">📅</span>
                    Due: {p.deadline}
                  </span>
                </div>

                <div className="student-project-footer">
                  <button className="student-project-btn">
                    View Groups →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SubjectProjects