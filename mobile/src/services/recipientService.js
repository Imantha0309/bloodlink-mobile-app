import api, { unwrap } from './api';

export const createRequest = (payload) => api.post('/recipient/requests', payload).then(unwrap);

export const updateProfile = (payload) => api.patch('/recipient/profile', payload).then(unwrap);

export const listRequests = (params) => api.get('/recipient/requests', { params }).then((r) => r.data);

export const getRequest = (id) => api.get(`/recipient/requests/${id}`).then(unwrap);

export const getRequestStatus = (id) => api.get(`/recipient/requests/${id}/status`).then(unwrap);

export const getMatchedDonors = (id) => api.get(`/recipient/requests/${id}/donors`).then(unwrap);

export const updateRequest = (id, payload) => api.patch(`/recipient/requests/${id}`, payload).then(unwrap);

export const cancelRequest = (id) => api.post(`/recipient/requests/${id}/cancel`).then(unwrap);

export const listNotifications = (params) => api.get('/recipient/notifications', { params }).then(unwrap);

export const markRead = (id) => api.patch(`/recipient/notifications/${id}/read`).then(unwrap);

export const markAllRead = () => api.post('/recipient/notifications/read-all').then(unwrap);

export default {
  createRequest,
  updateProfile,
  listRequests,
  getRequest,
  getRequestStatus,
  getMatchedDonors,
  updateRequest,
  cancelRequest,
  listNotifications,
  markRead,
  markAllRead,
};
