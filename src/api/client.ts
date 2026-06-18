import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const finalUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`[Axios Client Request] Method: ${config.method?.toUpperCase()} | URL: ${finalUrl}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (res) => {
    const finalUrl = `${res.config.baseURL || ''}${res.config.url || ''}`;
    console.log(`[Axios Client Response] URL: ${finalUrl} | Status: ${res.status}`);
    return res;
  },
  async (error) => {
    const finalUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    console.warn(
      `[Axios Client Response Error] URL: ${finalUrl} | Method: ${error.config?.method?.toUpperCase()} | Status: ${error.response?.status} | Error: ${error.message} | Data:`,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export default client;
