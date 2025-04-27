import axios from 'axios';

export const createApiClient = (logoutFn?: () => Promise<void>) => {
  const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4132/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Interceptor для добавления токена
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Interceptor для обработки 401
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const refreshResponse = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:4132/api'}/auth/refresh`,
            { withCredentials: true }
          );
          
          const newAccessToken = refreshResponse.headers['authorization']?.split(' ')[1];
          
          if (newAccessToken) {
            const storage = localStorage.getItem('accessToken') 
              ? localStorage 
              : sessionStorage;
            storage.setItem('accessToken', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          if (logoutFn) {
            await logoutFn();
          }
          
          // Убираем window.location.href
          return Promise.reject(new Error('Session expired'));
        }
      }
      
      return Promise.reject(error);
    }
  );

  return apiClient;
};

// Экспортируем клиент по умолчанию (без logout)
export default createApiClient();