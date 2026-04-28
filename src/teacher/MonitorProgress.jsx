import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './Teacher.css'

const summaryCardStyle = {
  padding: '18px',
  borderRadius: '18px',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
  backdropFilter: 'blur(8px)',
}

const detailPanelStyle = {
  padding: '18px',
  borderRadius: '16px',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
}

const MonitorProgress = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'PENDING'
  })
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    dueDate: ''
  })
  const selectedGroupDetails = groups.find((group) => group.id === selectedGroup) || null

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const response = await axiosClient.get('/teacher/groups', { params: { projectId } })
      setGroups(Array.isArray(response.data) ? response.data : [])
      setError('')
    } catch (err) {
      console.error(err)
      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : 'Error fetching groups'
      )
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [projectId])

  const fetchGroupDetails = async (groupId) => {
    try {
      const [tasksRes, milestonesRes, submissionsRes] = await Promise.all([
        axiosClient.get('/teacher/viewtasks', { params: { groupId } }),
        axiosClient.get('/teacher/viewmilestones', { params: { groupId } }),
        axiosClient.get('/teacher/viewsubmissions', { params: { groupId } })
      ])
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : [])
      setMilestones(Array.isArray(milestonesRes.data) ? milestonesRes.data : [])
      setSubmissions(Array.isArray(submissionsRes.data) ? submissionsRes.data : [])
      setError('')
    } catch (err) {
      console.error(err)
      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : 'Error fetching group details'
      )
      setTasks([])
      setMilestones([])
      setSubmissions([])
    }
  }

  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId)
    await fetchGroupDetails(groupId)
  }

  const handleAddTask = async (e) => {
    e.preventDefault()

    if (!selectedGroup) {
      setError('Please select a group first')
      return
    }

    if (!taskForm.title.trim()) {
      setError('Task title is required')
      return
    }

    try {
      await axiosClient.post(
        `/teacher/addtask?groupId=${selectedGroup}`,
        taskForm
      )
      setTaskForm({
        title: '',
        description: '',
        status: 'PENDING'
      })
      await fetchGroupDetails(selectedGroup)
    } catch (err) {
      console.error(err)
      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : 'Error adding task'
      )
    }
  }

  const handleAddMilestone = async (e) => {
    e.preventDefault()

    if (!selectedGroup) {
      setError('Please select a group first')
      return
    }

    if (!milestoneForm.title.trim() || !milestoneForm.dueDate) {
      setError('Milestone title and due date are required')
      return
    }

    try {
      await axiosClient.post(
        `/teacher/addmilestone?groupId=${selectedGroup}`,
        milestoneForm
      )
      setMilestoneForm({
        title: '',
        description: '',
        status: 'PENDING',
        dueDate: ''
      })
      await fetchGroupDetails(selectedGroup)
    } catch (err) {
      console.error(err)
      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : 'Error adding milestone'
      )
    }
  }

  return (
    <div>
      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>Monitor Project Progress</h2>
          <p>Select a group to view tasks, milestones, and submissions</p>
        </div>
        {error && <div className="teacher-error">{error}</div>}
        {loading ? (
          <p className="teacher-loading">Loading groups...</p>
        ) : groups.length === 0 ? (
          <p className="teacher-loading">No groups found</p>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ ...summaryCardStyle, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
                <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Groups</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a' }}>{groups.length}</div>
                <div style={{ fontSize: '13px', color: '#475569' }}>Available for monitoring</div>
              </div>
              <div style={{ ...summaryCardStyle, background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' }}>
                <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Tasks</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#065f46' }}>{tasks.length}</div>
                <div style={{ fontSize: '13px', color: '#475569' }}>Loaded for selected group</div>
              </div>
              <div style={{ ...summaryCardStyle, background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)' }}>
                <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase' }}>Milestones</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#9a3412' }}>{milestones.length}</div>
                <div style={{ fontSize: '13px', color: '#475569' }}>Progress checkpoints</div>
              </div>
              <div style={{ ...summaryCardStyle, background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)' }}>
                <div style={{ fontSize: '12px', color: '#7e22ce', fontWeight: 700, textTransform: 'uppercase' }}>Submissions</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#6b21a8' }}>{submissions.length}</div>
                <div style={{ fontSize: '13px', color: '#475569' }}>Ready for review</div>
              </div>
            </div>

            <div className="teacher-group-grid">
              {groups.map((g, index) => {
                const memberCount = Array.isArray(g.students) ? g.students.length : 0
                const isSelected = selectedGroup === g.id

                return (
                  <div
                    key={g.id}
                    className="teacher-group-card"
                    onClick={() => handleGroupSelect(g.id)}
                    style={{
                      cursor: 'pointer',
                      borderColor: isSelected ? '#2563eb' : undefined,
                      boxShadow: isSelected ? '0 0 0 3px rgba(37, 99, 235, 0.15), 0 16px 28px rgba(37, 99, 235, 0.14)' : undefined,
                      transform: isSelected ? 'translateY(-4px) scale(1.01)' : undefined,
                      background: isSelected ? 'linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)' : undefined,
                    }}
                  >
                    <div className="teacher-group-card-header">
                      <span className="teacher-group-name">{g.groupName || `Group ${index + 1}`}</span>
                    </div>
                    <span className="teacher-group-info">Max Members: {g.maxMembers}</span>
                    <span className="teacher-group-info">Current Members: {memberCount}</span>
                    <span className="teacher-group-info">
                      Availability: {memberCount >= (g.maxMembers || 0) ? 'Full' : 'Open'}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {selectedGroup && (
        <>
          <div className="teacher-section-card">
            <div className="teacher-section-header">
              <h2>{selectedGroupDetails?.groupName || 'Selected Group'}</h2>
              <p>Live overview of workload, milestones, and uploaded deliverables</p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
              }}
            >
              <div style={detailPanelStyle}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Members</div>
                <div style={{ marginTop: '8px', color: '#1e293b', fontWeight: 700 }}>
                  {selectedGroupDetails?.students?.length ? selectedGroupDetails.students.map((student) => student.name).join(', ') : 'No members'}
                </div>
              </div>
              <div style={detailPanelStyle}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Task Coverage</div>
                <div style={{ marginTop: '8px', color: '#1e293b', fontWeight: 700 }}>{tasks.length} active tasks</div>
              </div>
              <div style={detailPanelStyle}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Milestones</div>
                <div style={{ marginTop: '8px', color: '#1e293b', fontWeight: 700 }}>{milestones.length} checkpoints</div>
              </div>
              <div style={detailPanelStyle}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Submissions</div>
                <div style={{ marginTop: '8px', color: '#1e293b', fontWeight: 700 }}>{submissions.length} uploaded files</div>
              </div>
            </div>
          </div>

          <div className="teacher-section-card">
            <div className="teacher-section-header">
              <h2>Plan Work</h2>
              <p>Create tasks and milestones for this group. Students will see the same updates.</p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              <div className="teacher-form-container">
                <form onSubmit={handleAddTask}>
                  <h3 style={{ marginBottom: '12px', color: '#1e293b', fontSize: '1rem' }}>Add Task</h3>
                  <p style={{ margin: '0 0 14px 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Break the project into clear, trackable work items.
                  </p>
                  <div className="teacher-form-item">
                    <label className="teacher-form-label">Title</label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    />
                  </div>
                  <div className="teacher-form-item">
                    <label className="teacher-form-label">Description</label>
                    <textarea
                      rows="3"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    />
                  </div>
                  <div className="teacher-form-item">
                    <label className="teacher-form-label">Status</label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                  <button type="submit" className="teacher-primary-btn">Add Task</button>
                </form>
              </div>

              <div className="teacher-form-container">
                <form onSubmit={handleAddMilestone}>
                  <h3 style={{ marginBottom: '12px', color: '#1e293b', fontSize: '1rem' }}>Add Milestone</h3>
                  <p style={{ margin: '0 0 14px 0', color: '#64748b', fontSize: '0.84rem' }}>
                    Set checkpoints so students know what must be completed next.
                  </p>
                  <div className="teacher-form-item">
                    <label className="teacher-form-label">Title</label>
                    <input
                      type="text"
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                    />
                  </div>
                  <div className="teacher-form-item">
                    <label className="teacher-form-label">Description</label>
                    <textarea
                      rows="3"
                      value={milestoneForm.description}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                    />
                  </div>
                  <div className="teacher-form-item">
                    <label className="teacher-form-label">Due Date</label>
                    <input
                      type="date"
                      value={milestoneForm.dueDate}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="teacher-form-item">
                    <label className="teacher-form-label">Status</label>
                    <select
                      value={milestoneForm.status}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                  <button type="submit" className="teacher-primary-btn">Add Milestone</button>
                </form>
              </div>
            </div>
          </div>

          <div className="teacher-section-card">
            <div className="teacher-section-header">
              <h2>Tasks</h2>
              <p>Current tasks assigned to the group</p>
            </div>
            {tasks.length === 0 ? (
              <p className="teacher-loading">No tasks assigned</p>
            ) : (
              <div className="teacher-tasks-list">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="teacher-task-item"
                    style={{
                      borderLeft: '4px solid #3b82f6',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                      boxShadow: '0 10px 20px rgba(15, 23, 42, 0.05)',
                    }}
                  >
                    <span className="teacher-task-title">{task.title}</span>
                    <span className="teacher-task-assignee">Assigned to: {task.assignee?.name || 'Not Assigned'}</span>
                    <span className="teacher-task-status">Status: {task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="teacher-section-card">
            <div className="teacher-section-header">
              <h2>Milestones</h2>
              <p>Project milestones and progress</p>
            </div>
            {milestones.length === 0 ? (
              <p className="teacher-loading">No milestones set</p>
            ) : (
              <div className="teacher-milestones-list">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="teacher-milestone-item"
                    style={{
                      borderLeft: '4px solid #f59e0b',
                      background: 'linear-gradient(180deg, #ffffff 0%, #fffaf5 100%)',
                      boxShadow: '0 10px 20px rgba(15, 23, 42, 0.05)',
                    }}
                  >
                    <span className="teacher-milestone-title">{milestone.title}</span>
                    <span className="teacher-milestone-due">Due: {milestone.dueDate}</span>
                    <span className="teacher-milestone-status">Status: {milestone.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="teacher-section-card">
            <div className="teacher-section-header">
              <h2>Submissions</h2>
              <p>Review final submissions</p>
            </div>
            {submissions.length === 0 ? (
              <p className="teacher-loading">No submissions yet</p>
            ) : (
              <div className="teacher-submissions-list">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="teacher-submission-item"
                    style={{
                      display: 'grid',
                      gap: '10px',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      boxShadow: '0 12px 24px rgba(15, 23, 42, 0.06)',
                    }}
                  >
                    <span className="teacher-submission-title">{submission.title || submission.fileName || 'Submission'}</span>
                    <span className="teacher-submission-date">Submitted: {submission.submissionDate || submission.createdAt || 'N/A'}</span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        className="teacher-review-btn"
                        onClick={() => navigate(`/teacher/reviewsubmissions/${projectId}`)}
                      >
                        Open Review Portal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default MonitorProgress
