import {
  recordAccountModeration,
  recordAccountRegistration,
  recordAdminLogin,
  recordProfileUpdate,
  recordUserLogin,
} from './monitoringService'

const STORAGE_KEYS = {
  admin: 'portal.admin.account',
  student: 'portal.student.accounts',
  teacher: 'portal.teacher.accounts',
}

const FIXED_ADMIN_ACCOUNT = {
  id: 'admin-1',
  role: 'admin',
  name: 'Portal Administrator',
  email: 'saketh2007@gmail.com',
  username: 'saketh2007@gmail.com',
  password: '1234',
  status: 'active',
}

const ROLE_LABELS = {
  student: 'Student',
  teacher: 'Teacher',
}

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const normalizeText = (value = '') => value.trim()
const normalizeEmail = (value = '') => normalizeText(value).toLowerCase()
const normalizeUsername = (value = '') => normalizeText(value).toLowerCase()

const sanitizeAccount = (account) => {
  if (!account) {
    return null
  }

  const { password, ...safeAccount } = account
  return safeAccount
}

const storageKeyByRole = {
  student: STORAGE_KEYS.student,
  teacher: STORAGE_KEYS.teacher,
}

const readCollection = (role) => {
  initAccountStore()
  return safeParse(localStorage.getItem(storageKeyByRole[role]), [])
}

const writeCollection = (role, items) => {
  localStorage.setItem(storageKeyByRole[role], JSON.stringify(items))
}

const getStoredAdminAccount = () => {
  initAccountStore()
  return safeParse(localStorage.getItem(STORAGE_KEYS.admin), FIXED_ADMIN_ACCOUNT)
}

const createId = (role) => `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const getAllNonAdminAccounts = () => [...readCollection('student'), ...readCollection('teacher')]

const ensureUniqueAccount = ({ email, username }, currentId = null) => {
  const normalizedEmail = normalizeEmail(email)
  const normalizedUsername = normalizeUsername(username)
  const adminAccount = getStoredAdminAccount()

  if (normalizedEmail === normalizeEmail(adminAccount.email)) {
    throw new Error('This email is reserved for the admin account.')
  }

  if (normalizedUsername === normalizeUsername(adminAccount.username)) {
    throw new Error('This username is reserved for the admin account.')
  }

  const duplicate = getAllNonAdminAccounts().find((account) => {
    if (account.id === currentId) {
      return false
    }

    return (
      normalizeEmail(account.email) === normalizedEmail ||
      normalizeUsername(account.username) === normalizedUsername
    )
  })

  if (duplicate) {
    throw new Error('An account with the same email or username already exists.')
  }
}

const buildAccountPayload = (role, payload) => {
  const basePayload = {
    id: createId(role),
    role,
    status: 'active',
    createdAt: new Date().toISOString(),
    name: normalizeText(payload.name),
    email: normalizeEmail(payload.email),
    username: normalizeText(payload.username),
    password: payload.password,
    contact: normalizeText(payload.contact),
    department: normalizeText(payload.department),
  }

  if (role === 'student') {
    return {
      ...basePayload,
      gender: normalizeText(payload.gender),
      bloodgroup: normalizeText(payload.bloodgroup),
    }
  }

  return {
    ...basePayload,
    designation: normalizeText(payload.designation),
  }
}

const createAccount = (role, payload) => {
  ensureUniqueAccount(payload)

  const nextAccount = buildAccountPayload(role, payload)
  const accounts = readCollection(role)
  writeCollection(role, [nextAccount, ...accounts])

  return sanitizeAccount(nextAccount)
}

const updateAccount = (role, accountId, updater) => {
  const accounts = readCollection(role)
  const accountIndex = accounts.findIndex((account) => account.id === accountId)

  if (accountIndex === -1) {
    throw new Error(`${ROLE_LABELS[role]} account not found.`)
  }

  const updatedAccount = updater(accounts[accountIndex])
  const nextAccounts = [...accounts]
  nextAccounts[accountIndex] = updatedAccount
  writeCollection(role, nextAccounts)

  return sanitizeAccount(updatedAccount)
}

export const initAccountStore = () => {
  const storedAdmin = safeParse(localStorage.getItem(STORAGE_KEYS.admin), null)

  if (
    !storedAdmin ||
    storedAdmin.email !== FIXED_ADMIN_ACCOUNT.email ||
    storedAdmin.password !== FIXED_ADMIN_ACCOUNT.password
  ) {
    localStorage.setItem(STORAGE_KEYS.admin, JSON.stringify(FIXED_ADMIN_ACCOUNT))
  }

  if (!localStorage.getItem(STORAGE_KEYS.student)) {
    localStorage.setItem(STORAGE_KEYS.student, JSON.stringify([]))
  }

  if (!localStorage.getItem(STORAGE_KEYS.teacher)) {
    localStorage.setItem(STORAGE_KEYS.teacher, JSON.stringify([]))
  }
}

export const getAdminLoginHint = () => ({
  email: FIXED_ADMIN_ACCOUNT.email,
  password: FIXED_ADMIN_ACCOUNT.password,
})

export const loginAdmin = ({ email, password }) => {
  const adminAccount = getStoredAdminAccount()

  if (
    normalizeEmail(email) !== normalizeEmail(adminAccount.email) ||
    password !== adminAccount.password
  ) {
    throw new Error('Invalid admin email or password.')
  }

  const safeAdmin = sanitizeAccount(adminAccount)
  recordAdminLogin(safeAdmin)
  return safeAdmin
}

export const loginUser = (role, { email, password }) => {
  const account = readCollection(role).find(
    (item) => normalizeEmail(item.email) === normalizeEmail(email),
  )

  if (!account || account.password !== password) {
    throw new Error(`Invalid ${ROLE_LABELS[role].toLowerCase()} email or password.`)
  }

  if (account.status === 'blocked') {
    throw new Error(`This ${ROLE_LABELS[role].toLowerCase()} account is blocked by the admin.`)
  }

  const safeAccount = sanitizeAccount(account)
  recordUserLogin(role, safeAccount)
  return safeAccount
}

export const registerStudentAccount = (payload) => {
  const account = createAccount('student', payload)
  recordAccountRegistration('student', account, 'self')
  return account
}

export const registerTeacherAccount = (payload) => {
  const account = createAccount('teacher', payload)
  recordAccountRegistration('teacher', account, 'self')
  return account
}

export const createStudentAccountByAdmin = (payload) => {
  const account = createAccount('student', payload)
  recordAccountRegistration('student', account, 'admin')
  return account
}

export const createTeacherAccountByAdmin = (payload) => {
  const account = createAccount('teacher', payload)
  recordAccountRegistration('teacher', account, 'admin')
  return account
}

export const getAccountsByRole = (role) => (
  readCollection(role)
    .slice()
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .map((account) => sanitizeAccount(account))
)

export const updateAccountStatus = (role, accountId, nextStatus) => (
  (() => {
    const updatedAccount = updateAccount(role, accountId, (account) => ({
      ...account,
      status: nextStatus,
    }))

    recordAccountModeration(
      nextStatus === 'blocked' ? 'Blocked account' : 'Restored account',
      role,
      updatedAccount.name,
    )

    return updatedAccount
  })()
)

export const deleteAccountById = (role, accountId) => {
  const accounts = readCollection(role)
  const accountToDelete = accounts.find((account) => account.id === accountId)
  const nextAccounts = accounts.filter((account) => account.id !== accountId)

  if (nextAccounts.length === accounts.length) {
    throw new Error(`${ROLE_LABELS[role]} account not found.`)
  }

  writeCollection(role, nextAccounts)
  recordAccountModeration('Deleted account', role, accountToDelete?.name || 'Unknown user')
}

export const updateStudentProfileAccount = (accountId, updates) => {
  const updatedStudent = updateAccount('student', accountId, (account) => ({
    ...account,
    contact: normalizeText(updates.contact),
    bloodgroup: normalizeText(updates.bloodgroup),
    password: updates.password ? updates.password : account.password,
  }))

  recordProfileUpdate('student', updatedStudent)
  return updatedStudent
}

export const updateTeacherProfileAccount = (accountId, updates) => {
  const updatedTeacher = updateAccount('teacher', accountId, (account) => ({
    ...account,
    contact: normalizeText(updates.contact),
    designation: normalizeText(updates.designation),
    department: normalizeText(updates.department),
    password: updates.password ? updates.password : account.password,
  }))

  recordProfileUpdate('teacher', updatedTeacher)
  return updatedTeacher
}

export const getAccountStats = () => {
  const students = readCollection('student')
  const teachers = readCollection('teacher')
  const blockedCount = [...students, ...teachers].filter((account) => account.status === 'blocked').length

  return {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    blockedCount,
  }
}
