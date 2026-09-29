import api, { unwrap } from './api';

export const getStats = () => api.get('/admin/stats').then(unwrap);

export const listUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data);

export const setUserActive = (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }).then(unwrap);

export const deleteUser = (id) => api.delete(`/admin/users/${id}`).then(unwrap);

export const listHospitals = (params) => api.get('/admin/hospitals', { params }).then((r) => r.data);

export const verifyHospital = (id, isVerified) =>
  api.patch(`/admin/hospitals/${id}/verify`, { isVerified }).then(unwrap);

export const listRequests = (params) => api.get('/admin/requests', { params }).then((r) => r.data);

export const updateRequest = (id, payload) => api.patch(`/admin/requests/${id}`, payload).then(unwrap);

export const listVerifications = (params) => api.get('/admin/verifications', { params }).then((r) => r.data);

export const listSettings = () => api.get('/admin/settings').then(unwrap);

export const saveSetting = (key, value, description) =>
  api.put(`/admin/settings/${key}`, { value, description }).then(unwrap);

export const deleteSetting = (key) => api.delete(`/admin/settings/${key}`).then(unwrap);

export default {
  getStats,
  listUsers,
  setUserActive,
  deleteUser,
  listHospitals,
  verifyHospital,
  listRequests,
  updateRequest,
  listVerifications,
  listSettings,
  saveSetting,
  deleteSetting,
};
