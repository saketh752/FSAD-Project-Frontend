import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const SubjectProjects = () => {
  const { coursecode } = useParams()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/teacher/projects?coursecode=${coursecode}`
        )

        console.log("Admin Projects:", response.data)

        if (Array.isArray(response.data)) {
          setProjects(response.data)
        } else {
          setProjects([])
        }

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [coursecode])

  return (
    <div>

      <h2>Projects</h2>

      {loading ? (
        <p>Loading...</p>

      ) : projects.length === 0 ? (

        <p>No projects</p>

      ) : (

        <div>
          {(Array.isArray(projects) ? projects : []).map((p, index) => (
            <div key={index}>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default SubjectProjects