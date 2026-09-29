import api, { unwrap } from './api';

export const register = (payload) => api.post('/auth/register', payload).then(unwrap);

export const login = (payload) => api.post('/auth/login', payload).then(unwrap);
export const me = () => api.get('/auth/me').then(unwrap);

export default { register, login, me };
