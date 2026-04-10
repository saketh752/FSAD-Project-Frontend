import axiosClient from './axiosClient'
import { recordPortalVisit } from '../services/monitoringService'

const getErrorMessage = (error, fallbackMessage) => {
  const responseMessage = error?.response?.data

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage
  }

  return fallbackMessage
}

export const studentService = {
  async updateProfile(payload) {
    try {
      const { data } = await axiosClient.put('/student/profile', payload)
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Unable to update the student profile.'))
    }
  },

  trackPortalVisit(user, pathname) {
    return recordPortalVisit('student', user, pathname)
  },
}
