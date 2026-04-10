import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import './Teacher.css'

const ReviewSubmissions = () => {
  const { projectId } = useParams()

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [grade, setGrade] = useState('')

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/teacher/viewallsubmissions?projectId=${projectId}`)
      setSubmissions(response.data)
    } catch (err) {
      setError('Error fetching submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubmissions() }, [projectId])

  const handleReview = (submission) => {
    setSelectedSubmission(submission)
    setFeedback('')
    setGrade('')
  }

  const handleSubmitReview = async () => {
    try {
      await axios.post(`http://localhost:8080/api/teacher/reviewsubmission`, {
        submissionId: selectedSubmission.id,
        feedback,
        grade
      })
      setSelectedSubmission(null)
      fetchSubmissions()
    } catch (err) {
      setError('Error submitting review')
    }
  }

  return (
    <div>
      <div className="teacher-section-card">
        <div className="teacher-section-header">
          <h2>Review Final Submissions</h2>
          <p>Review and grade group project submissions</p>
        </div>
        {error && <div className="teacher-error">{error}</div>}
        {loading ? (
          <p className="teacher-loading">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="teacher-loading">No submissions to review</p>
        ) : (
          <div className="teacher-submissions-grid">
            {submissions.map((submission) => (
              <div key={submission.id} className="teacher-submission-card">
                <div className="teacher-submission-header">
                  <span className="teacher-submission-title">{submission.title}</span>
                  <span className="teacher-submission-group">Group {submission.groupId}</span>
                </div>
                <span className="teacher-submission-desc">{submission.description}</span>
                <span className="teacher-submission-date">Submitted: {submission.submissionDate}</span>
                <span className="teacher-submission-status">Status: {submission.status}</span>
                <button
                  className="teacher-review-btn"
                  onClick={() => handleReview(submission)}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="teacher-section-card">
          <div className="teacher-section-header">
            <h2>Review Submission: {selectedSubmission.title}</h2>
            <p>Provide feedback and grade</p>
          </div>
          <div className="teacher-review-form">
            <div className="teacher-form-item">
              <label className="teacher-form-label">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback"
                rows="4"
              />
            </div>
            <div className="teacher-form-item">
              <label className="teacher-form-label">Grade</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., A, B+, 85%"
              />
            </div>
            <button
              className="teacher-primary-btn"
              onClick={handleSubmitReview}
            >
              Submit Review
            </button>
            <button
              className="teacher-secondary-btn"
              onClick={() => setSelectedSubmission(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewSubmissions