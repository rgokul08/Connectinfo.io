import { createContext, useContext, useCallback, useMemo, useState } from 'react'
import { sha256Hex } from '../utils/hash'
import {
  uid,
  getUsers,
  saveUsers,
  getCurrentUserId,
  setCurrentUserId,
  clearCurrentUser,
  getAllContacts,
  saveAllContacts,
  getAllGroups,
  saveAllGroups,
  getAllActivities,
  saveAllActivities,
} from '../utils/storage'
import { buildDemoContacts, buildDemoGroups } from '../utils/seed'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export const DEMO_EMAIL = 'demo@connectinfo.app'
const DEMO_PASSWORD = 'demo1234'

function readInitialUser() {
  const id = getCurrentUserId()
  if (!id) return null
  return getUsers().find((u) => u.id === id) || null
}

export function AuthProvider({ children }) {
  // LocalStorage is synchronous — hydrate immediately so protected routes
  // and contact data render correctly on the very first paint.
  const [user, setUser] = useState(readInitialUser)
  const [loading] = useState(false)

  const publicUser = (u) => {
    const { passwordHash, ...rest } = u
    return rest
  }

  /* ---------------- Signup ---------------- */
  const signup = useCallback(async ({ name, email, password, phone = '', seedDemo = true }) => {
    await wait(450)
    const users = getUsers()
    const emailKey = email.trim().toLowerCase()
    if (users.some((u) => u.email.toLowerCase() === emailKey)) {
      throw new Error('An account with this email already exists.')
    }
    const passwordHash = await sha256Hex(password)
    const account = {
      id: uid('usr'),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatar: '',
      passwordHash,
      createdAt: new Date().toISOString(),
    }
    saveUsers([...users, account])
    if (seedDemo) {
      saveAllContacts([...getAllContacts(), ...buildDemoContacts(account.id)])
      saveAllGroups([...getAllGroups(), ...buildDemoGroups(account.id)])
    }
    setCurrentUserId(account.id, true)
    setUser(publicUser(account))
    return publicUser(account)
  }, [])

  /* ---------------- Login ---------------- */
  const login = useCallback(async ({ email, password, remember = true }) => {
    await wait(450)
    const account = getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!account) throw new Error("We couldn't find an account with that email.")
    const passwordHash = await sha256Hex(password)
    if (passwordHash !== account.passwordHash) throw new Error('Incorrect password. Please try again.')
    setCurrentUserId(account.id, remember)
    setUser(publicUser(account))
    return publicUser(account)
  }, [])

  /* ---------------- One-click demo account ---------------- */
  const loginDemo = useCallback(async () => {
    await wait(450)
    let account = getUsers().find((u) => u.email === DEMO_EMAIL)
    if (!account) {
      const passwordHash = await sha256Hex(DEMO_PASSWORD)
      account = {
        id: uid('usr'),
        name: 'Demo User',
        email: DEMO_EMAIL,
        phone: '+91 90000 00000',
        avatar: '',
        passwordHash,
        createdAt: new Date().toISOString(),
      }
      saveUsers([...getUsers(), account])
      saveAllContacts([...getAllContacts(), ...buildDemoContacts(account.id)])
      saveAllGroups([...getAllGroups(), ...buildDemoGroups(account.id)])
    }
    setCurrentUserId(account.id, true)
    setUser(publicUser(account))
    return publicUser(account)
  }, [])

  /* ---------------- Reset password (demo flow) ---------------- */
  const resetPassword = useCallback(async (email, newPassword) => {
    await wait(450)
    const users = getUsers()
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (idx === -1) throw new Error("We couldn't find an account with that email.")
    users[idx] = { ...users[idx], passwordHash: await sha256Hex(newPassword) }
    saveUsers(users)
  }, [])

  /* ---------------- Profile ---------------- */
  const updateProfile = useCallback(
    (patch) => {
      if (!user) return
      const users = getUsers()
      const updated = { ...users.find((u) => u.id === user.id), ...patch }
      saveUsers(users.map((u) => (u.id === user.id ? updated : u)))
      setUser(publicUser(updated))
    },
    [user]
  )

  const logout = useCallback(() => {
    clearCurrentUser()
    setUser(null)
  }, [])

  /* ---------------- Delete local account (+ its data) ---------------- */
  const deleteAccount = useCallback(() => {
    if (!user) return
    saveUsers(getUsers().filter((u) => u.id !== user.id))
    saveAllContacts(getAllContacts().filter((c) => c.ownerId !== user.id))
    saveAllGroups(getAllGroups().filter((g) => g.ownerId !== user.id))
    saveAllActivities(getAllActivities().filter((a) => a.userId !== user.id))
    clearCurrentUser()
    setUser(null)
  }, [user])

  const value = useMemo(
    () => ({ user, loading, signup, login, loginDemo, resetPassword, updateProfile, logout, deleteAccount }),
    [user, loading, signup, login, loginDemo, resetPassword, updateProfile, logout, deleteAccount]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
