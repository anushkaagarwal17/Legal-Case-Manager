import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Interceptors for structured logging
API.interceptors.request.use(
  config => {
    return config;
  },
  error => Promise.reject(error)
);

API.interceptors.response.use(
  response => response,
  error => {
    console.error('[API ERROR]', error.response?.status, error.message, error.response?.data);
    return Promise.reject(error);
  }
);

export default API;

// ── Auth & Users ─────────────────────────────────────────────────────────────
export const loginUser    = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getLawyers   = ()     => API.get('/auth/lawyers');
export const getClients   = ()     => API.get('/auth/clients');
export const getAllUsers  = ()     => API.get('/auth/users');

// ── Cases ────────────────────────────────────────────────────────────────────
export const getCases     = (params) => API.get('/cases/', { params });
export const getCase      = (id)     => API.get(`/cases/${id}`);
export const addCase      = (data)   => API.post('/cases/', data);
export const updateCase   = (id, d)  => API.put(`/cases/${id}`, d);
export const deleteCase   = (id)     => API.delete(`/cases/${id}`);
export const getStats     = (params) => API.get('/cases/stats', { params });

// ── Payments & Fee Ledger ────────────────────────────────────────────────────
export const addPayment         = (caseId, data) => API.post(`/cases/${caseId}/payments`, data);
export const getPayments        = (caseId)       => API.get(`/cases/${caseId}/payments`);
export const getPaymentSummary  = (params)       => API.get('/cases/payments/summary', { params });

// ── Hearings ─────────────────────────────────────────────────────────────────
export const getHearings   = (caseId) => API.get(`/cases/${caseId}/hearings`);
export const addHearing    = (caseId, data) => API.post(`/cases/${caseId}/hearings`, data);
export const updateHearing = (id, data)     => API.put(`/cases/hearings/${id}`, data);
export const getCauseList  = (date)         => API.get('/hearings/cause-list', { params: { date } });
export const getUpcoming   = ()             => API.get('/hearings/upcoming');

// ── Documents ────────────────────────────────────────────────────────────────
export const getDocuments    = (caseId) => API.get(`/cases/${caseId}/documents`);
export const uploadDocument  = (caseId, formData) =>
  API.post(`/cases/${caseId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteDocument  = (docId) => API.delete(`/cases/documents/${docId}`);

// ── AI Memo ──────────────────────────────────────────────────────────────────
export const generateMemo = (caseId, query) => API.post(`/cases/${caseId}/memo`, { query });
export const getMemos     = (caseId)         => API.get(`/cases/${caseId}/memos`);
