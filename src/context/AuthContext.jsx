import { createContext, useContext, useMemo, useState } from 'react'
import { sessionService } from '../api/authService'

const AuthContext = createContext(null)

const storageKeys = {
  admin: 'loggedInAdmin',
  student: 'loggedInStudent',
  teacher: 'loggedInTeacher',
}

const getStoredRole = () => sessionStorage.getItem('loggedInRole')

const getStoredUser = (role) => {
  if (!role || !storageKeys[role]) {
    return null
  }

  try {
    const value = sessionStorage.getItem(storageKeys[role])
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(getStoredRole)
  const [currentUser, setCurrentUser] = useState(() => getStoredUser(getStoredRole()))

  const loginAs = (nextRole, userData = null) => {
    setRole(nextRole)
    sessionStorage.setItem('loggedInRole', nextRole)

    if (storageKeys[nextRole] && userData) {
      sessionStorage.setItem(storageKeys[nextRole], JSON.stringify(userData))
      setCurrentUser(userData)
      return
    }

    setCurrentUser(getStoredUser(nextRole))
  }

  const updateCurrentUser = (userData) => {
    if (!role || !storageKeys[role]) {
      return
    }

    sessionStorage.setItem(storageKeys[role], JSON.stringify(userData))
    setCurrentUser(userData)
  }

  const logout = () => {
    const currentRole = role || getStoredRole()
    const activeUser = currentUser || getStoredUser(currentRole)

    if (currentRole && activeUser) {
      sessionService.signOut(currentRole, activeUser)
    }

    if (currentRole && storageKeys[currentRole]) {
      sessionStorage.removeItem(storageKeys[currentRole])
    }

    sessionStorage.removeItem('loggedInRole')
    setRole(null)
    setCurrentUser(null)
  }

  const value = useMemo(() => ({
    role,
    currentUser,
    isAuthenticated: Boolean(role),
    loginAs,
    logout,
    updateCurrentUser,
  }), [role, currentUser])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
