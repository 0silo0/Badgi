// src/api/client.ts
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4132/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем accessToken к каждому запросу
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка 401 ошибки и автоматическое обновление токена
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Если ошибка 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Пытаемся обновить токен
        const refreshResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:4132/api'}/auth/refresh`,
          { withCredentials: true }
        );
        
        // Извлекаем новый accessToken из заголовка
        const newAccessToken = refreshResponse.headers['authorization']?.split(' ')[1];
        
        if (newAccessToken) {
          // Сохраняем токен там же, где был предыдущий
          const storage = localStorage.getItem('accessToken') 
            ? localStorage 
            : sessionStorage;
          storage.setItem('accessToken', newAccessToken);
          
          // Обновляем заголовок оригинального запроса
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Повторяем оригинальный запрос
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Если обновление не удалось - делаем logout
        const { logout } = useAuth();
        await logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;