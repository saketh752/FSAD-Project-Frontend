import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import './Teacher.css'

const MonitorProgress = () => {
  const { projectId } = useParams()

  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [submissions, setSubmissions] = useState([])

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/teacher/viewgroupsbyproject?projectId=${projectId}`)
      setGroups(response.data)
    } catch (err) {
      setError('Error fetching groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups() }, [projectId])

  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId)
    try {
      const [tasksRes, milestonesRes, submissionsRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/teacher/viewtasks?groupId=${groupId}`),
        axios.get(`http://localhost:8080/api/teacher/viewmilestones?groupId=${groupId}`),
        axios.get(`http://localhost:8080/api/teacher/viewsubmissions?groupId=${groupId}`)
      ])
      setTasks(tasksRes.data)
      setMilestones(milestonesRes.data)
      setSubmissions(submissionsRes.data)
    } catch (err) {
      setError('Error fetching group details')
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
          <div className="teacher-group-grid">
            {groups.map((g, index) => (
              <div
                key={g.id}
                className={`teacher-group-card ${selectedGroup === g.id ? 'selected' : ''}`}
                onClick={() => handleGroupSelect(g.id)}
              >
                <div className="teacher-group-card-header">
                  <span className="teacher-group-name">Group {index + 1}</span>
                </div>
                <span className="teacher-group-info">Max Members: {g.maxMembers}</span>
                <span className="teacher-group-info">
                  Leader: {g.leader ? g.leader.name : 'Not Assigned'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedGroup && (
        <>
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
                  <div key={task.id} className="teacher-task-item">
                    <span className="teacher-task-title">{task.title}</span>
                    <span className="teacher-task-assignee">Assigned to: {task.assignee.name}</span>
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
                  <div key={milestone.id} className="teacher-milestone-item">
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
                  <div key={submission.id} className="teacher-submission-item">
                    <span className="teacher-submission-title">{submission.title}</span>
                    <span className="teacher-submission-date">Submitted: {submission.submissionDate}</span>
                    <button className="teacher-review-btn">Review</button>
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