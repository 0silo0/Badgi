import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthStyles.scss';

type LoginProps = {
  setIsAuthenticated: (value: boolean) => void;
};

export default function Login({ setIsAuthenticated }: LoginProps) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    login: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...credentials, rememberMe }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Неверный логин или пароль');
      }

      const data = await response.json();

      if (rememberMe) {
        localStorage.setItem('token', data.accessToken);
      } else {
        sessionStorage.setItem('token', data.accessToken);
      }

      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      console.error('Ошибка при входе:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Вход в систему</h2>

        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="input-field">
            <input
              type="text"
              placeholder="Введите логин"
              value={credentials.login}
              onChange={(e) => setCredentials({...credentials, login: e.target.value})}
            />
            <label>Логин</label>
          </div>

          <div className="input-field password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Введите пароль"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
            <label>Пароль</label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="custom-checkbox"></span>
              <span className="terms-text">Запомнить меня</span>
            </label>
          </div>

          <button type="submit" className="auth-button">
            Войти
          </button>
        </form>

        <div className="auth-footer">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          <div style={{ marginTop: '12px' }}>
          <Link to="/forgot-password">Забыли пароль?</Link>
           
          </div>
        </div>
      </div>
    </div>
  );
}