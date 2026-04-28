import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './Student.css'
import { useAuth } from '../context/AuthContext'

const MAX_FILE_SIZE = 20 * 1024 * 1024
const studentInfoPanelStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '12px',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 10px 20px rgba(15, 23, 42, 0.05)',
}

const ProjectGroups = () => {
  const { projectId } = useParams()
  const { currentUser: student } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [joinedGroupId, setJoinedGroupId] = useState(null)
  const [submissionTitle, setSubmissionTitle] = useState('')
  const [submissionDescription, setSubmissionDescription] = useState('')
  const [submissionFile, setSubmissionFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissionList, setSubmissionList] = useState([])
  const [taskList, setTaskList] = useState([])
  const [milestoneList, setMilestoneList] = useState([])

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

  useEffect(() => {
    const joinedGroup = groups.find((group) => {
      const members = Array.isArray(group.students) ? group.students : []
      return members.some((member) => member.id === student?.id)
    })

    const activeGroupId = joinedGroupId || joinedGroup?.id

    const fetchSubmissions = async () => {
      if (!activeGroupId) {
        setSubmissionList([])
        setTaskList([])
        setMilestoneList([])
        return
      }

      try {
        const [submissionResponse, taskResponse, milestoneResponse] = await Promise.all([
          axiosClient.get('/teacher/viewsubmissions', { params: { groupId: activeGroupId } }),
          axiosClient.get('/teacher/viewtasks', { params: { groupId: activeGroupId } }),
          axiosClient.get('/teacher/viewmilestones', { params: { groupId: activeGroupId } })
        ])
        setSubmissionList(Array.isArray(submissionResponse.data) ? submissionResponse.data : [])
        setTaskList(Array.isArray(taskResponse.data) ? taskResponse.data : [])
        setMilestoneList(Array.isArray(milestoneResponse.data) ? milestoneResponse.data : [])
      } catch (err) {
        console.error(err)
        setSubmissionList([])
        setTaskList([])
        setMilestoneList([])
      }
    }

    fetchSubmissions()
  }, [groups, joinedGroupId, student?.id])

  const handleJoinGroup = async (groupId) => {
    setError('')
    try {
      await axiosClient.post('/student/joingroup', { groupId })
      fetchGroups()
    } catch (err) {
      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : 'Error joining group'
      )
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null

    if (!file) {
      setSubmissionFile(null)
      return
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      setError('Only PDF files are allowed for submission')
      event.target.value = ''
      setSubmissionFile(null)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('PDF size must be less than 20MB')
      event.target.value = ''
      setSubmissionFile(null)
      return
    }

    setError('')
    setSubmissionFile(file)
  }

  const handleSubmitProject = async (groupId) => {
    if (!student?.id) {
      setError('Student session not found')
      return
    }

    if (!submissionTitle.trim()) {
      setError('Submission title is required')
      return
    }

    if (!submissionFile) {
      setError('Please select a PDF file')
      return
    }

    const formData = new FormData()
    formData.append('groupId', groupId)
    formData.append('studentId', student.id)
    formData.append('projectId', projectId)
    formData.append('title', submissionTitle.trim())
    formData.append('description', submissionDescription.trim())
    formData.append('file', submissionFile)

    try {
      setSubmitting(true)
      setError('')

      await axiosClient.post('/student/submitsubmission', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setMessage('Project submitted successfully!')
      setSubmissionTitle('')
      setSubmissionDescription('')
      setSubmissionFile(null)
      const fileInput = document.getElementById('student-project-pdf-input')
      if (fileInput) {
        fileInput.value = ''
      }
      fetchGroups()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error(err)
      setError(
        err.response?.status === 413
          ? 'PDF is too large. Please upload a file smaller than 20MB.'
          : typeof err.response?.data === 'string'
            ? err.response.data
            : 'Error submitting project. Make sure the backend endpoint supports PDF uploads.'
      )
    } finally {
      setSubmitting(false)
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
            <div className="student-empty-icon">Groups</div>
            <p className="student-empty-text">No groups available yet</p>
          </div>
        ) : (
          <div className="student-group-grid">
            {groups.map((g, index) => {
              const members = Array.isArray(g.students) ? g.students : []
              const currentMembers = members.length
              const maxMembers = g.maxMembers || 0
              const isJoined = joinedGroupId === g.id || members.some((member) => member.id === student?.id)
              const isFull = currentMembers >= maxMembers

              return (
                <div key={g.id} className="student-group-card">
                  <div className="student-group-badge">
                    <span className="group-badge-text">Group {index + 1}</span>
                  </div>

                  <div className="student-group-header">
                    <h3 className="student-group-title">{g.groupName || `Group ${index + 1}`}</h3>
                  </div>

                  <div className="student-group-stats">
                    <div className="stat-item">
                      <span className="stat-icon">Members</span>
                      <span className="stat-text">{currentMembers}/{maxMembers}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">Status</span>
                      <span className="stat-text">{isFull ? 'Full' : 'Open'}</span>
                    </div>
                  </div>

                  <div className="student-group-members-preview">
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

                  <div className="student-group-members">
                    <span className="student-group-members-title">Student Names</span>
                    <span className="stat-text">
                      {members.length > 0 ? members.map((member) => member.name).join(', ') : 'No members yet'}
                    </span>
                  </div>

                  <div className="student-group-footer">
                    {isJoined ? (
                      <button className="student-join-btn joined" disabled>
                        Joined
                      </button>
                    ) : (
                      <button
                        className="student-join-btn"
                        onClick={() => handleJoinGroup(g.id, maxMembers, currentMembers)}
                        disabled={isFull}
                      >
                        {isFull ? 'Group Full' : 'Join Group'}
                      </button>
                    )}
                  </div>

                  {isJoined && (
                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Submit Project PDF</h4>
                      <input
                        type="text"
                        placeholder="Submission title"
                        value={submissionTitle}
                        onChange={(e) => setSubmissionTitle(e.target.value)}
                        style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <textarea
                        placeholder="Short description"
                        value={submissionDescription}
                        onChange={(e) => setSubmissionDescription(e.target.value)}
                        rows="3"
                        style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <input
                        id="student-project-pdf-input"
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleFileChange}
                        style={{ marginBottom: '10px' }}
                      />
                      <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>
                        Only PDF files are accepted.
                      </p>
                      <button
                        className="student-join-btn"
                        onClick={() => handleSubmitProject(g.id)}
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting...' : 'Submit PDF'}
                      </button>

                      <div style={{ marginTop: '16px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Assigned Tasks</h4>
                        {taskList.length === 0 ? (
                          <p style={{ margin: 0, color: '#64748b' }}>No tasks assigned yet</p>
                        ) : (
                          <div style={{ display: 'grid', gap: '10px' }}>
                            {taskList.map((task) => (
                              <div
                                key={task.id}
                                style={studentInfoPanelStyle}
                              >
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{task.title}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                  {task.description || 'No description'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                                  Status: {task.status || 'PENDING'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '16px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Milestones</h4>
                        {milestoneList.length === 0 ? (
                          <p style={{ margin: 0, color: '#64748b' }}>No milestones added yet</p>
                        ) : (
                          <div style={{ display: 'grid', gap: '10px' }}>
                            {milestoneList.map((milestone) => (
                              <div
                                key={milestone.id}
                                style={studentInfoPanelStyle}
                              >
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{milestone.title}</div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                  {milestone.description || 'No description'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                                  Status: {milestone.status || 'PENDING'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#475569' }}>
                                  Due: {milestone.dueDate || 'Not set'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '16px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>My Group Submissions</h4>
                        {submissionList.length === 0 ? (
                          <p style={{ margin: 0, color: '#64748b' }}>No submissions yet</p>
                        ) : (
                          <div style={{ display: 'grid', gap: '10px' }}>
                            {submissionList.map((submission) => (
                              <div
                                key={submission.id}
                                style={studentInfoPanelStyle}
                              >
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                  {submission.title || submission.fileName || 'Submission'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                  Status: {submission.status || 'Pending Review'}
                                </div>
                                {(submission.fileUrl || submission.downloadUrl) && (
                                  <a
                                    href={`${submission.fileUrl || submission.downloadUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ fontSize: '12px' }}
                                  >
                                    View PDF
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
