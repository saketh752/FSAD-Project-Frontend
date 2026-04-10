import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Admin.css'

const ViewSubjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/teacher/viewsubjects?department=CSE`
        )

        console.log("Admin Subjects:", response.data)

        if (Array.isArray(response.data)) {
          setSubjects(response.data)
        } else {
          setSubjects([])
        }

      } catch (err) {
        console.error(err)
        setError('Error fetching subjects')
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  return (
    <div>

      <h2>All Subjects</h2>

      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading...</p>

      ) : subjects.length === 0 ? (

        <p>No subjects found</p>

      ) : (

        <div>
          {(Array.isArray(subjects) ? subjects : []).map((s, index) => (
            <div key={index}>
              <h3>{s.coursecode}</h3>
              <p>{s.subjectname}</p>
              <p>{s.semester}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default ViewSubjects