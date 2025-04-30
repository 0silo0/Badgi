import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './ResetPassword.scss';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    navigate('/login', { state: { passwordReset: true } });
  };

  return (
    <div className="password-reset-container">
      <div className="auth-container">
        <div className="graphic-section">
          <span>Безопасность аккаунта - наш приоритет</span>
        </div>

        <div className="form-section">
          <h2>Новый пароль</h2>
          
          <div className="input-group">
            <div className="input-field">
              <label>Новый пароль</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                />
                <span 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            <div className="input-field">
              <label>Подтвердите пароль</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                />
                <span 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
          </div>

          {error && <div className="error-message visible">{error}</div>}

          <div className="button-group">
            <button 
              className="btn cancel"
              onClick={() => navigate('/login')}
            >
              Отмена
            </button>
            <button 
              className="btn confirm"
              onClick={handleSubmit}
              disabled={!password || !confirmPassword}
            >
              Подтвердить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}