import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './Teacher.css'

const SubjectProjects = () => {
  const { coursecode } = useParams()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formVisible, setFormVisible] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  })

  const fetchProjects = async () => {
    try {
      const response = await axiosClient.get('/teacher/projects', { params: { coursecode } })
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

  useEffect(() => { fetchProjects() }, [coursecode])

  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.description || !formData.deadline) {
      setError('Please fill in all fields')
      return
    }
    try {
      await axiosClient.post('/teacher/addproject', formData, { params: { coursecode } })
      setMessage('Project added successfully!')
      setFormData({ title: '', description: '', deadline: '' })
      setFormVisible(false)
      fetchProjects()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Error adding project')
    }
  }

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axiosClient.delete('/teacher/deleteproject', { params: { projectId } })
        setMessage('Project deleted successfully!')
        fetchProjects()
        setTimeout(() => setMessage(''), 3000)
      } catch (err) {
        setError('Error deleting project')
      }
    }
  }

  return (
    <div className="teacher-page">
      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>Projects — {coursecode}</h2>
          <p>Create and manage projects for this subject</p>
        </div>

        {error && <div className="teacher-error">{error}</div>}
        {message && <div className="teacher-success">{message}</div>}

        <button
          className="teacher-primary-btn"
          onClick={() => setFormVisible(!formVisible)}
          style={{ marginBottom: '20px' }}
        >
          {formVisible ? '✕ Cancel' : '+ Add New Project'}
        </button>

        {formVisible && (
          <div className="teacher-form-container">
            <form onSubmit={handleAddProject}>
              <div className="teacher-form-grid">
                <div className="teacher-form-item">
                  <label className="teacher-form-label">Project Title</label>
                  <input
                    type="text"
                    placeholder="Enter project title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="teacher-form-item">
                  <label className="teacher-form-label">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="teacher-form-item" style={{ gridColumn: '1 / -1' }}>
                  <label className="teacher-form-label">Description</label>
                  <textarea
                    placeholder="Enter project description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    maxLength={255}
                    rows="3"
                  />
                </div>
              </div>
              <button type="submit" className="teacher-primary-btn">Add Project</button>
            </form>
          </div>
        )}
      </div>

      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>All Projects</h2>
          <p>Click on a project to manage groups and submissions</p>
        </div>

        {loading ? (
          <div className="teacher-loading-container">
            <div className="teacher-spinner"></div>
            <p className="teacher-loading">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="teacher-empty-state">
            <div className="teacher-empty-icon">📋</div>
            <p className="teacher-empty-text">No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="teacher-project-grid">
            {projects.map((p, index) => (
              <div key={p.id} className="teacher-project-card">
                <div className="teacher-project-badge">
                  <span className="project-badge-text">Project {index + 1}</span>
                </div>

                <h3 className="teacher-project-title">{p.title}</h3>

                <p className="teacher-project-desc">{p.description}</p>

                <div className="teacher-project-meta">
                  <span className="project-deadline">
                    <span className="meta-icon">📅</span>
                    {p.deadline}
                  </span>
                </div>

                <div className="teacher-project-actions">
                  <button
                    className="teacher-action-btn manage"
                    onClick={() => navigate(`/teacher/projectgroups/${p.id}`)}
                  >
                    👥 Manage Groups
                  </button>
                  <button
                    className="teacher-action-btn monitor"
                    onClick={() => navigate(`/teacher/monitorprogress/${p.id}`)}
                  >
                    📊 Monitor
                  </button>
                  <button
                    className="teacher-action-btn review"
                    onClick={() => navigate(`/teacher/reviewsubmissions/${p.id}`)}
                  >
                    ✓ Review
                  </button>
                  <button
                    className="teacher-action-btn delete"
                    onClick={() => handleDelete(p.id)}
                  >
                    🗑️ Delete
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