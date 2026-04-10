import axiosClient from './axiosClient'
import { recordPortalVisit } from '../services/monitoringService'

const getErrorMessage = (error, fallbackMessage) => {
  const responseMessage = error?.response?.data

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage
  }

  return fallbackMessage
}

export const teacherService = {
  async updateProfile(payload) {
    try {
      const { data } = await axiosClient.put('/teacher/profile', payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update the teacher profile.'))
    }
  },

  trackPortalVisit(user, pathname) {
    return recordPortalVisit('teacher', user, pathname)
  },
}
