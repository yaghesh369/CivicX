/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { openDB } from 'idb'
import {
  createComplaintApi,
  getComplaintsApi,
  getCurrentUserApi,
  getNotificationsApi,
  loginApi,
  registerApi,
} from '../services/api'
import i18n from '../i18n/i18n'

const CivicContext = createContext(null)

const PROFILE_KEY = 'civic-profile'

function profileKey(email) {
  return `${PROFILE_KEY}:${email || 'global'}`
}

function legacyProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null')
  } catch {
    return null
  }
}

function readProfile(email) {
  try {
    const stored = localStorage.getItem(profileKey(email))
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function persistProfile(profile, email) {
  if (profile) {
    localStorage.setItem(profileKey(email), JSON.stringify(profile))
  } else {
    localStorage.removeItem(profileKey(email))
  }
}

function withStoredProfile(user) {
  if (!user) return user
  const profile = readProfile(user.email) || legacyProfile()
  if (!profile) return user
  const merged = {
    ...user,
    name: user.name || profile.name,
    ward: user.ward ?? profile.ward,
    joinedAt: user.joinedAt || profile.joinedAt,
  }
  if (merged.name && merged.email && !readProfile(merged.email)) {
    persistProfile(
      { name: merged.name, joinedAt: merged.joinedAt, ward: merged.ward },
      merged.email,
    )
  }
  return merged
}

async function getDraftStore() {
  return openDB('civicconnect-drafts', 2, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('drafts')) {
        database.createObjectStore('drafts', { keyPath: 'id' })
      }
    },
  })
}

async function saveDraftsToIndexedDB(drafts) {
  if (!drafts || drafts.length === 0) return

  const db = await getDraftStore()
  const tx = db.transaction('drafts', 'readwrite')
  const store = tx.objectStore('drafts')

  await Promise.all(drafts.map((draft) => store.put(draft)))
  await tx.done
}

async function removeDraftsFromIndexedDB(ids) {
  if (!ids || ids.length === 0) return

  const db = await getDraftStore()
  const tx = db.transaction('drafts', 'readwrite')
  const store = tx.objectStore('drafts')

  await Promise.all(ids.map((id) => store.delete(id)))
  await tx.done
}

async function readDraftsFromIndexedDB() {
  try {
    const db = await getDraftStore()
    return await db.getAll('drafts')
  } catch {
    return []
  }
}

export function CivicProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return withStoredProfile(JSON.parse(localStorage.getItem('civic-user') || 'null'))
    } catch {
      return null
    }
  })
  const [language, setLanguage] = useState(() => localStorage.getItem('civic-language') || 'en')
  const [theme, setTheme] = useState(() => localStorage.getItem('civic-theme') || 'light')
  const [complaints, setComplaints] = useState([])
  const [notifications, setNotifications] = useState([])
  const [offlineDrafts, setOfflineDrafts] = useState([])

  useEffect(() => {
    i18n.changeLanguage(language)
    localStorage.setItem('civic-language', language)
  }, [language])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('civic-theme', theme)
  }, [theme])

  useEffect(() => {
    if (user) {
      localStorage.setItem('civic-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('civic-user')
    }
  }, [user])

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await getCurrentUserApi()
      setUser((prev) => {
        if (!prev) return prev
        const next = {
          ...prev,
          ...fresh,
          joinedAt: fresh.createdAt || prev.joinedAt,
        }
        const changed =
          prev.name !== next.name ||
          prev.email !== next.email ||
          prev.role !== next.role ||
          prev.ward !== next.ward ||
          prev.joinedAt !== next.joinedAt
        return changed ? next : prev
      })
    } catch {
      // Optional refresh failure; keep cached user.
    }
  }, [])

  const syncOfflineDrafts = useCallback(async () => {
    const stored = await readDraftsFromIndexedDB()
    if (stored.length > 0) {
      const syncedIds = []
      let error = false

      for (const draft of stored) {
        try {
          await createComplaintApi(draft)
          syncedIds.push(draft.id)
        } catch {
          error = true
          break
        }
      }

      if (syncedIds.length > 0) {
        await removeDraftsFromIndexedDB(syncedIds)
        setOfflineDrafts((prev) => prev.filter((item) => !syncedIds.includes(item.id)))

        const refreshed = await getComplaintsApi()
        setComplaints(refreshed.complaints)
      }

      return { success: !error, syncedCount: syncedIds.length }
    }

    return { success: true, syncedCount: 0 }
  }, [])

  useEffect(() => {
    if (!user) return

    const loadInitialData = async () => {
      const [complaintsResult, notificationsResult, draftsResult] = await Promise.allSettled([
        getComplaintsApi(),
        getNotificationsApi(),
        readDraftsFromIndexedDB(),
      ])

      refreshUser()

      if (complaintsResult.status === 'fulfilled') {
        setComplaints(complaintsResult.value.complaints)
      }
      if (notificationsResult.status === 'fulfilled') {
        setNotifications(notificationsResult.value.notifications)
      }

      const savedDrafts = draftsResult.status === 'fulfilled' ? draftsResult.value : []
      if (savedDrafts.length > 0) {
        setOfflineDrafts(savedDrafts)
        if (navigator.onLine) {
          syncOfflineDrafts()
        }
      }
    }

    loadInitialData()
  }, [user, syncOfflineDrafts, refreshUser])

  useEffect(() => {
    if (offlineDrafts.length > 0) {
      saveDraftsToIndexedDB(offlineDrafts)
      localStorage.setItem('civic-offline-drafts', JSON.stringify(offlineDrafts))
    }
  }, [offlineDrafts])

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.onLine) return

    const handleOnline = () => {
      if (user) {
        syncOfflineDrafts()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user, syncOfflineDrafts])

  const login = async ({ email, password }) => {
    try {
      const result = await loginApi({ email, password })
      if (result.success) {
        if (result.access && result.refresh) {
          localStorage.setItem('civic-tokens', JSON.stringify({ access: result.access, refresh: result.refresh }))
        }
        setUser(withStoredProfile(result.user))
      }
      return result
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed. Please try again.' }
    }
  }

  const register = async ({ name, email, password }) => {
    try {
      const result = await registerApi({ name, email, password })
      if (result.success) {
        if (result.access && result.refresh) {
          localStorage.setItem('civic-tokens', JSON.stringify({ access: result.access, refresh: result.refresh }))
        }
        persistProfile({ name: result.user.name, joinedAt: Date.now() }, result.user.email)
        setUser(result.user)
      }
      return result
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Unable to create account.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('civic-tokens')
    localStorage.removeItem('civic-user')
    setUser(null)
    setComplaints([])
    setNotifications([])
    setOfflineDrafts([])
  }

  const addComplaint = (complaint) => {
    setComplaints((prev) => [complaint, ...prev])
    return complaint
  }

  const addDraft = useCallback((draft) => {
    setOfflineDrafts((prev) => {
      const merged = [draft, ...prev.filter((item) => item.id !== draft.id)]
      return merged
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      setUser,
      complaints,
      setComplaints,
      notifications,
      setNotifications,
      language,
      setLanguage,
      theme,
      setTheme,
      login,
      register,
      logout,
      addComplaint,
      offlineDrafts,
      addDraft,
      syncOfflineDrafts,
      refreshUser,
    }),
    [user, complaints, notifications, language, theme, offlineDrafts, syncOfflineDrafts, addDraft, refreshUser],
  )

  return <CivicContext.Provider value={value}>{children}</CivicContext.Provider>
}

export function useCivicContext() {
  const context = useContext(CivicContext)

  if (!context) {
    throw new Error('useCivicContext must be used within CivicProvider')
  }

  return context
}
