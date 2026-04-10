import axiosClient from './axiosClient'
import { getMonitoringSummary } from '../services/monitoringService'

const getErrorMessage = (error, fallbackMessage) => {
  const responseMessage = error?.response?.data

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage
  }

  return fallbackMessage
}

export const adminService = {
  async getDashboardSnapshot() {
    try {
      const [studentsResponse, teachersResponse] = await Promise.all([
        axiosClient.get('/admin/students'),
        axiosClient.get('/admin/teachers'),
      ])
      const students = studentsResponse.data ?? []
      const teachers = teachersResponse.data ?? []
      const monitoring = getMonitoringSummary()
      const blockedAccounts = [...students, ...teachers].filter(
        (account) => account?.status?.toUpperCase() === 'BLOCKED',
      ).length

      return {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        blockedAccounts,
        activeStudents: monitoring.activeStudents,
        activeTeachers: monitoring.activeTeachers,
        totalTrackedEvents: monitoring.totalTrackedEvents,
        activeSessions: monitoring.activeSessions,
        recentActivities: monitoring.recentActivities,
      }
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load the admin dashboard.'))
    }
  },

  async createStudent(payload) {
    try {
      const { data } = await axiosClient.post('/auth/student/register', payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create student account.'))
    }
  },

  async createTeacher(payload) {
    try {
      const { data } = await axiosClient.post('/auth/teacher/register', payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to create teacher account.'))
    }
  },

  async getStudents() {
    try {
      const { data } = await axiosClient.get('/admin/students')
      return data ?? []
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load students.'))
    }
  },

  async getTeachers() {
    try {
      const { data } = await axiosClient.get('/admin/teachers')
      return data ?? []
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to load teachers.'))
    }
  },

  async updateStudentStatus(accountId, nextStatus) {
    const action = nextStatus.toUpperCase() === 'BLOCKED' ? 'block' : 'unblock'

    try {
      const { data } = await axiosClient.patch(`/admin/students/${accountId}/${action}`)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update the student account status.'))
    }
  },

  async updateTeacherStatus(accountId, nextStatus) {
    const action = nextStatus.toUpperCase() === 'BLOCKED' ? 'block' : 'unblock'

    try {
      const { data } = await axiosClient.patch(`/admin/teachers/${accountId}/${action}`)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update the teacher account status.'))
    }
  },

  async deleteStudent(accountId) {
    try {
      const { data } = await axiosClient.delete(`/admin/students/${accountId}`)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete the student account.'))
    }
  },

  async deleteTeacher(accountId) {
    try {
      const { data } = await axiosClient.delete(`/admin/teachers/${accountId}`)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to delete the teacher account.'))
    }
  },
}
