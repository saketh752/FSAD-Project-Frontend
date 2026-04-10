import axiosClient from './axiosClient'
import { recordUserLogout } from '../services/monitoringService'

const getErrorMessage = (error, fallbackMessage) => {
  const responseMessage = error?.response?.data

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage
  }

  return fallbackMessage
}

export const adminAuthService = {
  async signIn(credentials) {
    try {
      const { data } = await axiosClient.post('/auth/admin/login', credentials)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to sign in as admin.'))
    }
  },
}

export const studentAuthService = {
  async signIn(credentials) {
    try {
      const { data } = await axiosClient.post('/auth/student/login', credentials)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to sign in as student.'))
    }
  },
  async register(payload) {
    try {
      const { data } = await axiosClient.post('/auth/student/register', payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to register student account.'))
    }
  },
}

export const teacherAuthService = {
  async signIn(credentials) {
    try {
      const { data } = await axiosClient.post('/auth/teacher/login', credentials)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to sign in as teacher.'))
    }
  },
  async register(payload) {
    try {
      const { data } = await axiosClient.post('/auth/teacher/register', payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to register teacher account.'))
    }
  },
}

export const sessionService = {
  signOut(role, user) {
    recordUserLogout(role, user)
  },
}
