import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosClient from '../api/axiosClient'
import './Teacher.css'

const reviewSummaryCardStyle = {
  padding: '18px',
  borderRadius: '18px',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
}

const ReviewSubmissions = () => {
  const { projectId } = useParams()

  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [grade, setGrade] = useState('')
  const reviewedCount = submissions.filter((submission) => submission.status && submission.status !== 'Pending Review').length

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const groupsResponse = await axiosClient.get(
        '/teacher/groups', { params: { projectId } }
      )

      const groups = Array.isArray(groupsResponse.data) ? groupsResponse.data : []

      const submissionResponses = await Promise.all(
        groups.map((group) =>
          axiosClient.get('/teacher/viewsubmissions', { params: { groupId: group.id } })
        )
      )

      const aggregatedSubmissions = submissionResponses.flatMap((response, index) => {
        const group = groups[index]
        const items = Array.isArray(response.data) ? response.data : []

        return items.map((submission) => ({
          ...submission,
          groupId: submission.groupId || group?.id,
          groupName: submission.groupName || group?.groupName,
        }))
      })

      setSubmissions(aggregatedSubmissions)
      setError('')
    } catch (err) {
      console.error(err)
      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : 'Error fetching submissions'
      )
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [projectId])

  const handleReview = (submission) => {
    setSelectedSubmission(submission)
    setFeedback('')
    setGrade('')
  }

  const handleSubmitReview = async () => {
    const parsedGrade = Number(grade)

    if (!Number.isInteger(parsedGrade)) {
      setError('Grade must be a whole number')
      return
    }

    try {
      await axiosClient.post('/teacher/reviewsubmission', {
        submissionId: selectedSubmission.id,
        feedback,
        grade: parsedGrade
      })
      setSelectedSubmission(null)
      fetchSubmissions()
    } catch (err) {
      console.error(err)
      setError(
        typeof err.response?.data === 'string'
          ? err.response.data
          : 'Error submitting review'
      )
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ ...reviewSummaryCardStyle, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
            <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a' }}>{submissions.length}</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Submissions found</div>
          </div>
          <div style={{ ...reviewSummaryCardStyle, background: 'linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)' }}>
            <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 700, textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#92400e' }}>{Math.max(submissions.length - reviewedCount, 0)}</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Need review</div>
          </div>
          <div style={{ ...reviewSummaryCardStyle, background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' }}>
            <div style={{ fontSize: '12px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Reviewed</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#065f46' }}>{reviewedCount}</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Already graded</div>
          </div>
        </div>
        {loading ? (
          <p className="teacher-loading">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="teacher-loading">No submissions to review</p>
        ) : (
          <div className="teacher-submissions-grid">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="teacher-submission-card"
                style={{
                  border: selectedSubmission?.id === submission.id ? '2px solid #2563eb' : undefined,
                  boxShadow: selectedSubmission?.id === submission.id
                    ? '0 0 0 3px rgba(37, 99, 235, 0.12), 0 18px 32px rgba(37, 99, 235, 0.12)'
                    : '0 14px 30px rgba(15, 23, 42, 0.08)',
                  background: selectedSubmission?.id === submission.id
                    ? 'linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)'
                    : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                }}
              >
                <div className="teacher-submission-header">
                  <span className="teacher-submission-title">
                    {submission.title || submission.fileName || 'Submission'}
                  </span>
                  <span className="teacher-submission-group">
                    {submission.groupName || `Group ${submission.groupId}`}
                  </span>
                </div>
                <span className="teacher-submission-desc">
                  {submission.description || 'Project submission'}
                </span>
                <span className="teacher-submission-date">
                  Submitted: {submission.submissionDate || submission.createdAt || 'N/A'}
                </span>
                <span className="teacher-submission-status">
                  Status: {submission.status || 'Pending Review'}
                </span>
                <div style={{ display: 'grid', gap: '10px', marginTop: '8px' }}>
                  {submission.fileUrl && (
                    <a
                      href={`${API_BASE_URL}${submission.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="teacher-review-btn"
                      style={{ textAlign: 'center', textDecoration: 'none' }}
                    >
                      View PDF
                    </a>
                  )}
                  <button
                    className="teacher-review-btn"
                    onClick={() => handleReview(submission)}
                  >
                    {selectedSubmission?.id === submission.id ? 'Editing Review' : 'Review Submission'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="teacher-section-card">
          <div className="teacher-section-header">
            <h2>Review Submission: {selectedSubmission.title || selectedSubmission.fileName || 'Submission'}</h2>
            <p>Provide feedback, assign a numeric grade, and finalize the review</p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              marginBottom: '18px',
            }}
          >
            <div style={{ padding: '16px', borderRadius: '14px', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Group</div>
              <div style={{ marginTop: '8px', color: '#1e293b', fontWeight: 700 }}>{selectedSubmission.groupName || `Group ${selectedSubmission.groupId}`}</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '14px', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Submitted</div>
              <div style={{ marginTop: '8px', color: '#1e293b', fontWeight: 700 }}>{selectedSubmission.submissionDate || selectedSubmission.createdAt || 'N/A'}</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '14px', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Current Status</div>
              <div style={{ marginTop: '8px', color: '#1e293b', fontWeight: 700 }}>{selectedSubmission.status || 'Pending Review'}</div>
            </div>
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
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter numeric grade"
              />
            </div>
            <button
              className="teacher-primary-btn"
              onClick={handleSubmitReview}
            >
              Save Review
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
