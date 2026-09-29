import api, { unwrap } from './api';

export const getDashboard = () => api.get('/hospital/dashboard').then(unwrap);

export const listRequests = (params) => api.get('/hospital/requests', { params }).then((r) => r.data);

export const getRequest = (id) => api.get(`/hospital/requests/${id}`).then(unwrap);

export const updateRequestStatus = (id, payload) =>
  api.patch(`/hospital/requests/${id}/status`, payload).then(unwrap);

export const recordDonation = (payload) => api.post('/hospital/verifications', payload).then(unwrap);

export const listVerifications = (params) => api.get('/hospital/verifications', { params }).then((r) => r.data);

export default {
  getDashboard,
  listRequests,
  getRequest,
  updateRequestStatus,
  recordDonation,
  listVerifications,
};
