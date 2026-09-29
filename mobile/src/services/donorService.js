import api, { unwrap } from './api';

export const getProfile = () => api.get('/donor/profile').then(unwrap);

export const updateProfile = (payload) => api.patch('/donor/profile', payload).then(unwrap);

export const setAvailability = (isAvailable) => api.put('/donor/availability', { isAvailable }).then(unwrap);

export const listMatchedRequests = (params) => api.get('/donor/requests', { params }).then(unwrap);

export const getRequest = (id) => api.get(`/donor/requests/${id}`).then(unwrap);

export const respond = (id, response) => api.post(`/donor/requests/${id}/respond`, { response }).then(unwrap);

export const listNotifications = (params) => api.get('/donor/notifications', { params }).then(unwrap);

export default {
  getProfile,
  updateProfile,
  setAvailability,
  listMatchedRequests,
  getRequest,
  respond,
  listNotifications,
};
