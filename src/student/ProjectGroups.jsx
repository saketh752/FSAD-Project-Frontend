import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import './Student.css'
import { useAuth } from '../context/AuthContext'

const ProjectGroups = () => {
  const { projectId } = useParams()
  const { currentUser: student } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [joinedGroupId, setJoinedGroupId] = useState(null)

  const fetchGroups = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/teacher/groups?projectId=${projectId}`
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

  useEffect(() => { fetchGroups() }, [projectId])

  const handleJoinGroup = async (groupId, maxMembers, currentMembers) => {
    if (currentMembers >= maxMembers) {
      setError('This group is full')
      return
    }
    try {
      await axios.post(
        "http://localhost:8080/api/student/joingroup",
        {
          groupId: groupId,
          studentId: student.id
        }
      )
      setMessage('Successfully joined group!')
      setJoinedGroupId(groupId)
      fetchGroups()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Error joining group')
    }
  }

  return (
    <div className="student-page">
      <div className="student-section-card">
        <div className="student-section-header">
          <h2>Available Groups</h2>
          <p>Join a group to start collaborating</p>
        </div>

        {error && <div className="student-error">{error}</div>}
        {message && <div className="student-success">{message}</div>}

        {loading ? (
          <div className="student-loading-container">
            <div className="student-spinner"></div>
            <p className="student-loading">Loading groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="student-empty-state">
            <div className="student-empty-icon">👥</div>
            <p className="student-empty-text">No groups available yet</p>
          </div>
        ) : (
          <div className="student-group-grid">
            {groups.map((g, index) => (
              <div key={g.id} className="student-group-card">
                <div className="student-group-badge">
                  <span className="group-badge-text">Group {index + 1}</span>
                </div>

                <div className="student-group-header">
                  <h3 className="student-group-title">{g.groupName || `Group ${index + 1}`}</h3>
                </div>

                <div className="student-group-stats">
                  <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <span className="stat-text">{g.currentMembers || 0}/{g.maxMembers || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">👤</span>
                    <span className="stat-text">Leader: {g.leader?.name || 'Not Assigned'}</span>
                  </div>
                </div>

                <div className="student-group-members-preview">
                  <span className="members-label">Members:</span>
                  <div className="members-avatars">
                    {g.members && g.members.slice(0, 3).map((member, i) => (
                      <div key={i} className="member-avatar" title={member.name}>
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {g.members && g.members.length > 3 && (
                      <div className="member-avatar more">+{g.members.length - 3}</div>
                    )}
                  </div>
                </div>

                <div className="student-group-footer">
                  {joinedGroupId === g.id ? (
                    <button className="student-join-btn joined" disabled>
                      ✓ Joined
                    </button>
                  ) : (
                    <button
                      className="student-join-btn"
                      onClick={() => handleJoinGroup(g.id, g.maxMembers, g.currentMembers || 0)}
                      disabled={g.currentMembers >= g.maxMembers}
                    >
                      {g.currentMembers >= g.maxMembers ? 'Group Full' : 'Join Group'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectGroups