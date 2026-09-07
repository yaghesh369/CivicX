import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_BASE, timeout: 15000 })

function decodeTokenPayload(token) {
  try {
    const base64 = token.split('.')[1]
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('civic-tokens')
  const tokens = raw ? JSON.parse(raw) : null
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token) {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      if (orig.url?.includes('/auth/refresh')) {
        localStorage.removeItem('civic-tokens')
        localStorage.removeItem('civic-user')
        window.location.href = '/login'
        return Promise.reject(err)
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          orig.headers.Authorization = `Bearer ${token}`
          return api(orig)
        })
      }
      orig._retry = true
      isRefreshing = true
      try {
        const raw = localStorage.getItem('civic-tokens')
        const tokens = raw ? JSON.parse(raw) : null
        if (!tokens?.refresh) throw new Error('No refresh token')
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refresh: tokens.refresh })
        const next = { ...tokens, access: data.access }
        localStorage.setItem('civic-tokens', JSON.stringify(next))
        processQueue(null, data.access)
        orig.headers.Authorization = `Bearer ${data.access}`
        return api(orig)
      } catch (e) {
        processQueue(e, null)
        localStorage.removeItem('civic-tokens')
        localStorage.removeItem('civic-user')
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  },
)

const CATEGORY_LABELS = {
  GARBAGE: 'Garbage',
  ROAD: 'Road',
  POTHOLE: 'Pothole',
  WATER_LEAKAGE: 'Water Leakage',
  WATER_SUPPLY: 'Water Supply',
  DRAINAGE: 'Drainage',
  STREETLIGHT: 'Streetlight',
  PUBLIC_PROPERTY_DAMAGE: 'Public Property Damage',
  ILLEGAL_DUMPING: 'Illegal Dumping',
  OTHER: 'Other',
}

const CATEGORY_EMOJIS = {
  GARBAGE: '🗑',
  ROAD: '🛣',
  POTHOLE: '🚧',
  WATER_LEAKAGE: '💧',
  WATER_SUPPLY: '💧',
  DRAINAGE: '🚰',
  STREETLIGHT: '💡',
  PUBLIC_PROPERTY_DAMAGE: '🏗',
  ILLEGAL_DUMPING: '🗑',
  OTHER: '📌',
}

const FRONTEND_TO_BACKEND_CATEGORY = {
  pothole: 'POTHOLE',
  road: 'ROAD',
  garbage: 'GARBAGE',
  water: 'WATER_LEAKAGE',
  water_leakage: 'WATER_LEAKAGE',
  water_supply: 'WATER_SUPPLY',
  streetlight: 'STREETLIGHT',
  drainage: 'DRAINAGE',
  public_property_damage: 'PUBLIC_PROPERTY_DAMAGE',
  illegal_dumping: 'ILLEGAL_DUMPING',
  other: 'OTHER',
}

function capitalize(s) {
  if (!s) return s
  return s.charAt(0) + s.slice(1).toLowerCase()
}

function mapComplaint(c) {
  if (!c) return null
  return {
    id: c.id,
    complaintNumber: c.complaintNumber,
    title: c.title,
    category: CATEGORY_LABELS[c.category] || c.category,
    categoryKey: c.category,
    categoryEmoji: CATEGORY_EMOJIS[c.category] || '📌',
    department: c.department?.name || '',
    priority: capitalize(c.priority),
    priorityKey: c.priority,
    status: c.status?.toLowerCase(),
    statusKey: c.status,
    description: c.description,
    location: { lat: c.latitude, lng: c.longitude },
    latitude: c.latitude,
    longitude: c.longitude,
    image: c.images?.[0]?.imageUrl || null,
    images: c.images || [],
    address: c.address,
    ward: c.ward,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    resolvedAt: c.resolvedAt,
    timeline: [],
    assignment: c.assignment,
    aiAnalysis: c.aiAnalysis,
    userId: c.userId,
    user: c.user,
  }
}

function mapTimeline(history) {
  if (!history || !Array.isArray(history)) return []
  const statusOrder = ['SUBMITTED', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']
  const completedSet = new Set(history.map((h) => h.newStatus))

  return statusOrder.map((status) => {
    const entry = history.find((h) => h.newStatus === status)
    return {
      status: status.toLowerCase(),
      label: capitalize(status.replace(/_/g, ' ')),
      completed: completedSet.has(status),
      time: entry ? new Date(entry.createdAt).toLocaleString() : 'Pending',
      comment: entry?.comment,
      changedBy: entry?.changedBy,
    }
  })
}

function mapNotification(n) {
  if (!n) return null
  const typeMap = {
    COMPLAINT_SUBMITTED: 'success',
    COMPLAINT_ASSIGNED: 'info',
    WORK_STARTED: 'info',
    COMPLAINT_RESOLVED: 'success',
    VERIFICATION_REQUIRED: 'warning',
    COMPLAINT_REOPENED: 'warning',
    GENERAL: 'info',
  }
  return {
    id: n.id,
    text: n.title,
    detail: n.message,
    read: n.isRead,
    type: typeMap[n.type] || 'info',
    complaintId: n.complaintId,
    createdAt: n.createdAt,
  }
}

export async function loginApi({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  const user =
    data.user ||
    (() => {
      const payload = decodeTokenPayload(data.access)
      return payload ? { id: payload.id, email: payload.email, role: payload.role } : { email }
    })()
  return { success: true, user, access: data.access, refresh: data.refresh }
}

export async function getCurrentUserApi() {
  const { data } = await api.get('/auth/me')
  return data.user
}

export async function registerApi({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password })
  return { success: true, user: data.user, access: data.access, refresh: data.refresh }
}

export async function getComplaintsApi({ page = 1, pageSize = 20, status, category, search } = {}) {
  const params = { page, page_size: pageSize }
  if (status) params.status = status
  if (category) params.category = category
  if (search) params.search = search
  const { data } = await api.get('/complaints', { params })
  return {
    complaints: (data.results || []).map(mapComplaint),
    total: data.count,
    page: data.page,
    totalPages: data.total_pages,
  }
}

export async function getComplaintApi(id) {
  const { data } = await api.get(`/complaints/${id}`)
  const complaint = mapComplaint(data)
  try {
    const timelineRes = await api.get(`/complaints/${id}/timeline`)
    complaint.timeline = mapTimeline(timelineRes.data)
  } catch {
    complaint.timeline = []
  }
  return { complaint }
}

export async function createComplaintApi({ title, description, category, latitude, longitude, address, ward }) {
  const backendCategory = FRONTEND_TO_BACKEND_CATEGORY[category] || category || 'OTHER'
  const { data } = await api.post('/complaints', {
    title: title || 'Civic Issue',
    description: description || '',
    category: backendCategory,
    latitude: latitude ?? 0,
    longitude: longitude ?? 0,
    address,
    ward,
  })
  return { success: true, complaintId: data.id, complaint: mapComplaint(data) }
}

export async function uploadComplaintImageApi(complaintId, file) {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('imageType', 'EVIDENCE')
  const { data } = await api.post(`/complaints/${complaintId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function reopenComplaintApi({ id, reason }) {
  const { data } = await api.post(`/complaints/${id}/reopen`, { comment: reason })
  return { success: true, complaint: mapComplaint(data) }
}

export async function submitFeedbackApi({ id, rating, comment }) {
  const { data } = await api.post(`/complaints/${id}/feedback`, { rating, comment })
  return { success: true, feedback: data }
}

export async function getNotificationsApi() {
  const { data } = await api.get('/notifications')
  const notifications = Array.isArray(data) ? data.map(mapNotification) : []
  return { notifications }
}

export async function markNotificationReadApi(id) {
  await api.patch(`/notifications/${id}/read`)
}

export async function markAllNotificationsReadApi() {
  await api.patch('/notifications/read-all')
}

export async function getNearbyComplaintsApi({ latitude, longitude, category, radiusKm = 1 } = {}) {
  const params = { latitude, longitude, radius_km: radiusKm }
  if (category) params.category = category
  const { data } = await api.get('/complaints/nearby', { params })
  return Array.isArray(data) ? data.map(mapComplaint) : []
}

export async function saveAIAnalysisApi(complaintId, { category, priority, department, confidence, reason }) {
  const { data } = await api.post(`/complaints/${complaintId}/ai-analysis`, {
    category, priority, department, confidence, reason,
  })
  return data
}

export async function getAIAnalysisApi({ description, category }) {
  const title = (description || '').toLowerCase()
  const categoryHints = {
    pothole: 'POTHOLE', road: 'ROAD', garbage: 'GARBAGE', waste: 'GARBAGE',
    water: 'WATER_LEAKAGE', drain: 'DRAINAGE', streetlight: 'STREETLIGHT',
    light: 'STREETLIGHT', illegal: 'ILLEGAL_DUMPING', damage: 'PUBLIC_PROPERTY_DAMAGE',
  }
  let guessed = 'OTHER'
  for (const [hint, cat] of Object.entries(categoryHints)) {
    if (title.includes(hint)) { guessed = cat; break }
  }
  if (category) {
    guessed = FRONTEND_TO_BACKEND_CATEGORY[category] || guessed
  }
  const isHigh = title.includes('large') || title.includes('danger') || title.includes('critical') || title.includes('flood')
  const deptMap = {
    POTHOLE: 'Road Department', ROAD: 'Road Department', GARBAGE: 'Sanitation Department',
    WATER_LEAKAGE: 'Water Department', WATER_SUPPLY: 'Water Department', DRAINAGE: 'Drainage Department',
    STREETLIGHT: 'Electrical Department', ILLEGAL_DUMPING: 'Sanitation Department',
    PUBLIC_PROPERTY_DAMAGE: 'Road Department', OTHER: 'General Department',
  }
  return {
    success: true,
    result: {
      category: CATEGORY_LABELS[guessed] || 'Other',
      categoryKey: guessed,
      department: deptMap[guessed] || 'General Department',
      priority: isHigh ? 'High' : 'Medium',
      priorityKey: isHigh ? 'HIGH' : 'MEDIUM',
      confidence: 85 + Math.floor(Math.random() * 15),
    },
  }
}
