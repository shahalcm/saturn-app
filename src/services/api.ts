import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

// Since API_URL is http://<ip>:5000/api, we remove the trailing /api suffix using regex
// to support the requested /api/... endpoints cleanly without malforming the subdomain.
const baseHost = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: baseHost,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  const finalUrl = `${config.baseURL || ''}${config.url || ''}`;
  console.log(`[Axios Request] Method: ${config.method?.toUpperCase()} | URL: ${finalUrl}`);
  
  return config;
});

let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (cb: (() => void) | null) => {
  onUnauthorizedCallback = cb;
};

api.interceptors.response.use(
  (res) => {
    const finalUrl = `${res.config.baseURL || ''}${res.config.url || ''}`;
    console.log(`[Axios Response] URL: ${finalUrl} | Status: ${res.status}`);
    return res;
  },
  async (error) => {
    const finalUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    console.warn(
      `[Axios Response Error] URL: ${finalUrl} | Method: ${error.config?.method?.toUpperCase()} | Status: ${error.response?.status} | Error: ${error.message} | Data:`,
      error.response?.data
    );
    if (
      error.response?.status === 401 ||
      (error.response?.status === 404 && error.config?.url?.includes('/users/profile'))
    ) {
      await AsyncStorage.multiRemove(['authToken', 'userId', 'userRole', 'userReligion']);
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  sendOTP: (phone: string) => api.post('/api/auth/send-otp', { phone, type: 'login' }),
  verifyOTP: (phone: string, otp: string, type: string, userData?: any) =>
    api.post('/api/auth/verify-otp', { phone, otp, type, userData }),
};

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data: any) => api.put('/api/users/profile', data),
  updateAvatar: (formData: FormData) => api.put('/api/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateFCMToken: (fcmToken: string) => api.put('/api/users/fcm-token', { fcmToken }),
};

export const providerAPI = {
  getAll: (filters?: any) => api.get('/api/providers', { params: filters }),
  getById: (id: string) => api.get(`/api/providers/${id}`),
  getReviews: (providerId: string) => api.get(`/api/reviews/provider/${providerId}`),
};

export const sessionAPI = {
  startSession: (providerId: string, type: string) => api.post('/api/sessions/start', { providerId, type }),
  endSession: (id: string) => api.put(`/api/sessions/${id}/end`),
  getMySessions: (status?: string, page?: number) => api.get('/api/sessions/my', { params: { status, page } }),
};

export const chatAPI = {
  getConversations: () => api.get('/api/chat/conversations'),
  getMessages: (sessionId: string) => api.get(`/api/chat/${sessionId}/messages`),
  sendMessage: (sessionId: string, content: string, receiverId: string) =>
    api.post(`/api/chat/${sessionId}/messages`, { content, receiverId }),
  markAsRead: (senderId: string) => api.put(`/api/chat/read/${senderId}`),
};

export const prayerAPI = {
  getAll: (religion: string | null) => api.get('/api/prayers', { params: { religion } }),
  getLive: (religion: string | null) => api.get('/api/prayers/live', { params: { religion } }),
};

export const educationAPI = {
  getAll: (religion?: string | null) => api.get('/api/courses', { params: { religion } }),
  enroll: (courseId: string) => api.post(`/api/courses/${courseId}/enroll`, { paymentId: `pay_${Date.now()}` }),
  getEnrolled: () => api.get('/api/courses/enrolled/me'),
};

export const communityAPI = {
  getPosts: () => api.get('/api/community'),
  createPost: (content: string) => api.post('/api/community', { content }),
  likePost: (id: string) => api.put(`/api/community/${id}/like`),
  commentPost: (id: string, text: string) => api.post(`/api/community/${id}/comment`, { text }),
};

export const advertisementAPI = {
  getActive: (religion: string | null, position: string) =>
    api.get('/api/advertisements', { params: { religion, position } }),
  trackClick: (id: string) => api.put(`/api/advertisements/${id}/click`),
};

export const paymentAPI = {
  createOrder: (amount: number) => api.post('/api/payments/create-order', { amount }),
  verifyPayment: (data: any) => api.post('/api/payments/verify', data),
};

export const reviewAPI = {
  submit: (data: any) => api.post('/api/reviews', data),
};

export const agoraAPI = {
  getToken: (channelName: string, uid: number) =>
    api.post('/api/agora/token', { channelName, uid, role: 'publisher' }),
};

export default api;
