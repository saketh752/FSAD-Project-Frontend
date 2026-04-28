import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './Teacher.css'

const ProjectGroups = () => {
  const { projectId } = useParams()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formVisible, setFormVisible] = useState(false)
  const [formData, setFormData] = useState({
    groupName: '',
    maxMembers: '5'
  })
  const [selectedGroup, setSelectedGroup] = useState(null)

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get(
        '/teacher/groups',
        { params: { projectId } }
      )
      setGroups(Array.isArray(res.data) ? res.data : [])
      setError('')
    } catch (err) {
      console.error(err)
      setError('Error fetching groups')
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [projectId])

  const handleAddGroup = async (e) => {
    e.preventDefault()
    if (!formData.groupName || !formData.maxMembers) {
      setError('Please fill in all fields')
      return
    }
    try {
      setError('')
      await axiosClient.post(
        '/teacher/addgroup',
        { groupName: formData.groupName, maxMembers: parseInt(formData.maxMembers, 10) },
        { params: { projectId } }
      )
      setMessage('Group created successfully!')
      setFormData({ groupName: '', maxMembers: '5' })
      setFormVisible(false)
      fetchGroups()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : 'Error creating group'
      )
    }
  }

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        setError('')
        await axiosClient.delete('/teacher/deletegroup', { params: { groupId } })
        setMessage('Group deleted successfully!')
        fetchGroups()
        setTimeout(() => setMessage(''), 3000)
      } catch (err) {
        setError(
          typeof err.response?.data === 'string'
            ? err.response.data
            : 'Error deleting group'
        )
      }
    }
  }

  return (
    <div className="teacher-page">
      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>Manage Groups</h2>
          <p>Create and manage groups for this project</p>
        </div>

        {error && <div className="teacher-error">{error}</div>}
        {message && <div className="teacher-success">{message}</div>}

        <button
          className="teacher-primary-btn"
          onClick={() => setFormVisible(!formVisible)}
          style={{ marginBottom: '20px' }}
        >
          {formVisible ? 'Cancel' : '+ Create Group'}
        </button>

        {formVisible && (
          <div className="teacher-form-container">
            <form onSubmit={handleAddGroup}>
              <div className="teacher-form-grid">
                <div className="teacher-form-item">
                  <label className="teacher-form-label">Group Name</label>
                  <input
                    type="text"
                    placeholder="Enter group name"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    maxLength={50}
                  />
                </div>
                <div className="teacher-form-item">
                  <label className="teacher-form-label">Max Members</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              <button type="submit" className="teacher-primary-btn">Create Group</button>
            </form>
          </div>
        )}
      </div>

      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>All Groups</h2>
          <p>View and manage all groups for this project</p>
        </div>

        {loading ? (
          <div className="teacher-loading-container">
            <div className="teacher-spinner"></div>
            <p className="teacher-loading">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="teacher-empty-state">
            <div className="teacher-empty-icon">Groups</div>
            <p className="teacher-empty-text">No groups created yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="teacher-group-grid">
            {groups.map((g, index) => {
              const members = Array.isArray(g.students) ? g.students : []
              const currentMembers = members.length

              return (
                <div key={g.id} className="teacher-group-card">
                  <div className="teacher-group-badge">
                    <span className="group-badge-text">Group {index + 1}</span>
                  </div>

                  <div className="teacher-group-header">
                    <h3 className="teacher-group-title">{g.groupName || `Group ${index + 1}`}</h3>
                  </div>

                  <div className="teacher-group-stats">
                    <div className="stat-item">
                      <span className="stat-icon">Members</span>
                      <span className="stat-text">{currentMembers}/{g.maxMembers || 0}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">Student Names</span>
                      <span className="stat-text">
                        {members.length > 0 ? members.map((member) => member.name).join(', ') : 'No members yet'}
                      </span>
                    </div>
                  </div>

                  <div className="teacher-group-members-preview">
                    <span className="members-label">Members:</span>
                    <div className="members-avatars">
                      {members.slice(0, 3).map((member, i) => (
                        <div key={member.id || i} className="member-avatar" title={member.name}>
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {members.length > 3 && (
                        <div className="member-avatar more">+{members.length - 3}</div>
                      )}
                    </div>
                  </div>

                  <div className="teacher-group-actions">
                    <button
                      className="teacher-group-action-btn view"
                      onClick={() => setSelectedGroup(selectedGroup === g.id ? null : g.id)}
                    >
                      View Members
                    </button>
                    <button
                      className="teacher-group-action-btn delete"
                      onClick={() => handleDeleteGroup(g.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {selectedGroup === g.id && (
                    <div className="teacher-group-members-list">
                      <h4>Group Members</h4>
                      {members.length > 0 ? (
                        <ul className="members-list">
                          {members.map((member) => (
                            <li key={member.id} className="member-item">
                              <span className="member-name">{member.name}</span>
                              <span className="member-id">ID: {member.id}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-members">No members in this group yet</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectGroups
