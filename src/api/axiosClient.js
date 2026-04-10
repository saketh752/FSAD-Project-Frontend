import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export const apiConfig = {
  baseURL: API_BASE_URL,
  mode: import.meta.env.VITE_DATA_MODE || 'local',
}

export default axiosClient
