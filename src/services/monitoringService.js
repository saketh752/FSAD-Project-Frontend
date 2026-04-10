const STORAGE_KEYS = {
  activities: 'portal.monitor.activities',
  sessions: 'portal.monitor.sessions',
}

const MAX_ACTIVITY_ITEMS = 250
const ONLINE_WINDOW_MS = 15 * 60 * 1000

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const emitMonitoringUpdate = () => {
  window.dispatchEvent(new Event('portal-monitor-updated'))
}

const readActivities = () => (
  safeParse(localStorage.getItem(STORAGE_KEYS.activities), [])
)

const writeActivities = (items) => {
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(items))
  emitMonitoringUpdate()
}

const readSessions = () => (
  safeParse(localStorage.getItem(STORAGE_KEYS.sessions), [])
)

const writeSessions = (items) => {
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(items))
  emitMonitoringUpdate()
}

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const getActorDisplayName = (user, fallbackRole = 'User') => (
  user?.name || user?.username || user?.email || fallbackRole
)

const getRouteLabel = (role, pathname) => {
  const routeMap = {
    '/student/home': 'Dashboard',
    '/student/profile': 'Profile',
    '/student/viewsubjects': 'Subject Catalog',
    '/teacher/home': 'Dashboard',
    '/teacher/profile': 'Profile',
    '/teacher/viewsubjects': 'Subject Catalog',
    '/admin/home': 'Admin Dashboard',
  }

  if (routeMap[pathname]) {
    return routeMap[pathname]
  }

  if (pathname.includes('/subjectprojects/')) {
    return 'Subject Projects'
  }

  if (pathname.includes('/projectgroups/')) {
    return 'Project Groups'
  }

  return role === 'teacher' ? 'Teacher Workspace' : 'Student Workspace'
}

const upsertSession = ({ role, user, currentPath = '', currentPage = '', isOnline = true, setLoginTime = false }) => {
  if (!role || !user?.id) {
    return
  }

  const sessions = readSessions()
  const sessionKey = `${role}:${user.id}`
  const existingIndex = sessions.findIndex((session) => session.sessionKey === sessionKey)
  const now = new Date().toISOString()

  const nextSession = {
    sessionKey,
    role,
    userId: user.id,
    userName: getActorDisplayName(user, role),
    email: user.email || '',
    department: user.department || '',
    currentPath,
    currentPage,
    isOnline,
    lastActiveAt: now,
    lastLoginAt: setLoginTime ? now : (existingIndex >= 0 ? sessions[existingIndex].lastLoginAt : ''),
  }

  const nextSessions = [...sessions]

  if (existingIndex >= 0) {
    nextSessions[existingIndex] = {
      ...nextSessions[existingIndex],
      ...nextSession,
      lastLoginAt: setLoginTime
        ? now
        : (nextSessions[existingIndex].lastLoginAt || nextSession.lastLoginAt),
    }
  } else {
    nextSessions.unshift(nextSession)
  }

  writeSessions(nextSessions)
}

const appendActivity = ({
  actorRole,
  actorName,
  action,
  description,
  targetRole = '',
  targetName = '',
}) => {
  const nextEntry = {
    id: createId('activity'),
    createdAt: new Date().toISOString(),
    actorRole,
    actorName,
    action,
    description,
    targetRole,
    targetName,
  }

  const currentItems = readActivities()
  const nextItems = [nextEntry, ...currentItems].slice(0, MAX_ACTIVITY_ITEMS)
  writeActivities(nextItems)
}

export const initMonitoringStore = () => {
  if (!localStorage.getItem(STORAGE_KEYS.activities)) {
    localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify([]))
  }

  if (!localStorage.getItem(STORAGE_KEYS.sessions)) {
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify([]))
  }
}

export const recordAdminLogin = (adminUser) => {
  upsertSession({
    role: 'admin',
    user: adminUser,
    currentPath: '/admin/home',
    currentPage: 'Admin Dashboard',
    isOnline: true,
    setLoginTime: true,
  })

  appendActivity({
    actorRole: 'admin',
    actorName: getActorDisplayName(adminUser, 'Administrator'),
    action: 'Signed in',
    description: 'Admin signed in to the portal.',
  })
}

export const recordUserLogin = (role, user) => {
  upsertSession({
    role,
    user,
    currentPath: `/${role}/home`,
    currentPage: 'Dashboard',
    isOnline: true,
    setLoginTime: true,
  })

  appendActivity({
    actorRole: role,
    actorName: getActorDisplayName(user, role),
    action: 'Signed in',
    description: `${getActorDisplayName(user, role)} signed in to the ${role} portal.`,
  })
}

export const recordUserLogout = (role, user) => {
  if (!role || !user?.id) {
    return
  }

  upsertSession({
    role,
    user,
    currentPath: '',
    currentPage: '',
    isOnline: false,
  })

  appendActivity({
    actorRole: role,
    actorName: getActorDisplayName(user, role),
    action: 'Signed out',
    description: `${getActorDisplayName(user, role)} signed out of the ${role} portal.`,
  })
}

export const recordPortalVisit = (role, user, pathname) => {
  if (!role || !user?.id || !pathname) {
    return
  }

  const pageLabel = getRouteLabel(role, pathname)
  const latestActivity = readActivities()[0]

  if (
    latestActivity &&
    latestActivity.actorRole === role &&
    latestActivity.actorName === getActorDisplayName(user, role) &&
    latestActivity.action === 'Viewed page' &&
    latestActivity.description === `${getActorDisplayName(user, role)} opened ${pageLabel}.`
  ) {
    upsertSession({
      role,
      user,
      currentPath: pathname,
      currentPage: pageLabel,
      isOnline: true,
    })
    return
  }

  upsertSession({
    role,
    user,
    currentPath: pathname,
    currentPage: pageLabel,
    isOnline: true,
  })

  appendActivity({
    actorRole: role,
    actorName: getActorDisplayName(user, role),
    action: 'Viewed page',
    description: `${getActorDisplayName(user, role)} opened ${pageLabel}.`,
  })
}

export const recordAccountRegistration = (role, user, source = 'self') => {
  const description = source === 'admin'
    ? `Admin created a ${role} account for ${getActorDisplayName(user, role)}.`
    : `${getActorDisplayName(user, role)} registered a new ${role} account.`

  appendActivity({
    actorRole: source === 'admin' ? 'admin' : role,
    actorName: source === 'admin' ? 'Administrator' : getActorDisplayName(user, role),
    action: source === 'admin' ? 'Created account' : 'Registered account',
    description,
    targetRole: role,
    targetName: getActorDisplayName(user, role),
  })
}

export const recordProfileUpdate = (role, user) => {
  appendActivity({
    actorRole: role,
    actorName: getActorDisplayName(user, role),
    action: 'Updated profile',
    description: `${getActorDisplayName(user, role)} updated profile details.`,
  })
}

export const recordAccountModeration = (action, role, userName) => {
  appendActivity({
    actorRole: 'admin',
    actorName: 'Administrator',
    action,
    description: `Admin ${action.toLowerCase()} ${role} account for ${userName}.`,
    targetRole: role,
    targetName: userName,
  })
}

export const getMonitoringSummary = () => {
  const activities = readActivities()
  const sessions = readSessions()
  const now = Date.now()

  const sortedSessions = sessions
    .slice()
    .sort((first, second) => Date.parse(second.lastActiveAt || 0) - Date.parse(first.lastActiveAt || 0))

  const activeSessions = sortedSessions.filter((session) => (
    session.isOnline && session.lastActiveAt && (now - Date.parse(session.lastActiveAt) <= ONLINE_WINDOW_MS)
  ))
  const portalSessions = activeSessions.filter((session) => session.role === 'student' || session.role === 'teacher')

  return {
    totalTrackedEvents: activities.length,
    activeStudents: portalSessions.filter((session) => session.role === 'student').length,
    activeTeachers: portalSessions.filter((session) => session.role === 'teacher').length,
    activeSessions: portalSessions,
    recentActivities: activities.slice(0, 12),
  }
}
