// src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (credentials: { loginOrEmail: string; password: string; remember: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  setAuthError: (error: string | null) => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('accessToken') || !!sessionStorage.getItem('accessToken')
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = async ({ loginOrEmail, password, remember }: { 
    loginOrEmail: string; 
    password: string; 
    remember: boolean 
  }) => {
    try {
      setAuthError(null);
      const response = await apiClient.post('/auth/login', {
        loginOrEmail,
        password,
        rememberMe: remember,
      });

      const { accessToken } = response.data;

      // Сохраняем токен в соответствии с remember
      if (remember) {
        localStorage.setItem('accessToken', accessToken);
      } else {
        sessionStorage.setItem('accessToken', accessToken);
      }

      setIsAuthenticated(true);
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка авторизации';
      setAuthError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      authError,
      setAuthError 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);