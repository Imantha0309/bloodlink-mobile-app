import api, { unwrap } from './api';

export const list = (params) => api.get('/notifications', { params }).then(unwrap);

export const unreadCount = () => api.get('/notifications/unread-count').then(unwrap);

export const markRead = (id) => api.patch(`/notifications/${id}/read`).then(unwrap);

export const markAllRead = () => api.post('/notifications/read-all').then(unwrap);

export default { list, unreadCount, markRead, markAllRead };
