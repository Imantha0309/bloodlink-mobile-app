import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TIMEOUT_MS, STORAGE_KEYS } from '../utils/constants';

export const tokenStore = {
  get: () => AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
  set: (token) => AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
  clear: () => AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
};

export const api = axios.create({ baseURL: API_BASE_URL, timeout: TIMEOUT_MS });

api.interceptors.request.use(async (config) => {
  const token = await tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) tokenStore.clear();
    return Promise.reject(error);
  }
);

export const unwrap = (promise) => promise.then((res) => res.data.data);

export default api;
