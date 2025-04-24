import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.scss';

export default function Login() {
  const [credentials, setCredentials] = useState({ login: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    if (!credentials.login || !credentials.password) {
      setError('Все поля обязательны для заполнения');
      return;
    }
    
    if (credentials.remember) {
      localStorage.setItem('token', 'dummy-token');
    } else {
      sessionStorage.setItem('token', 'dummy-token');
    }
    
    login(); 
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="auth-container">
        <div className="graphic-section">
          <span>Добро пожаловать!</span>
        </div>
        
        <div className="form-section">
          <h2>Вход в систему</h2>

          <div className={`error-message ${error ? 'visible' : ''}`}>
            {error}
          </div>
          
          <div className="input-field">
            <label>Логин или Email</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={credentials.login}
                onChange={(e) => {
                    setCredentials({...credentials, login: e.target.value});
                    setError('');
                 }}
              />
            </div>
          </div>

          <div className="input-field">
            <label>Пароль</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => {
                    setCredentials({...credentials, password: e.target.value});
                    setError('');
                }}
              />
              <span 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <label className="remember-me">
            <input
              type="checkbox"
              checked={credentials.remember}
              onChange={(e) => setCredentials({...credentials, remember: e.target.checked})}
            />
            Запомнить меня
          </label>

          <button className="auth-button" onClick={handleLogin}>Войти</button>
          
          <div 
            className="register-link"
            onClick={() => navigate('/register')}
          >
            Нет аккаунта? Зарегистрироваться
          </div>
        </div>
      </div>
    </div>
  );
}