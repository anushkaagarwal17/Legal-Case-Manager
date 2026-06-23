import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Cases
export const getCases     = (params) => API.get('/cases/', { params })
export const getCase      = (id)     => API.get(`/cases/${id}`)
export const addCase      = (data)   => API.post('/cases/', data)
export const updateCase   = (id, d)  => API.put(`/cases/${id}`, d)
export const deleteCase   = (id)     => API.delete(`/cases/${id}`)
export const getStats     = ()       => API.get('/cases/stats')

// Hearings
export const getHearings   = (caseId) => API.get(`/cases/${caseId}/hearings`)
export const addHearing    = (caseId, data) => API.post(`/cases/${caseId}/hearings`, data)
export const updateHearing = (id, data)     => API.put(`/cases/hearings/${id}`, data)
export const getCauseList  = (date)         => API.get('/hearings/cause-list', { params: { date } })
export const getUpcoming   = ()             => API.get('/hearings/upcoming')

// Documents
export const getDocuments    = (caseId) => API.get(`/cases/${caseId}/documents`)
export const uploadDocument  = (caseId, formData) =>
  API.post(`/cases/${caseId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteDocument  = (docId) => API.delete(`/cases/documents/${docId}`)

// AI Memo
export const generateMemo = (caseId, query) => API.post(`/cases/${caseId}/memo`, { query })
export const getMemos     = (caseId)         => API.get(`/cases/${caseId}/memos`)