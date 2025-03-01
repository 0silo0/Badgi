import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthStyles.scss';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    login: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof typeof formData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
  
      if (!agreeTerms) {
        setError('Необходимо согласиться с условиями');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:4132/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            login: formData.login,
            password: formData.password,
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Ошибка при регистрации');
        }
  
        navigate('/login');
      } catch (err) {
        console.error('Ошибка при регистрации:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      }
    };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Создать аккаунт</h2>
        <form onSubmit={handleRegister}>
        {error && <div className="error-message">{error}</div>}
          <div className="input-field">
            <input
              type="text"
              placeholder="Введите ваше Имя"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
            />
            <label>Имя</label>
          </div>

          <div className="input-field">
            <input
              type="text"
              placeholder="Введите вашу Фамилию"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
            />
            <label>Фамилия</label>
          </div>

          <div className="input-field">
            <input
              type="text"
              placeholder="Придумайте Логин"
              value={formData.login}
              onChange={handleInputChange('login')}
            />
            <label>Логин</label>
          </div>

          <div className="input-field">
            <input
              type="email"
              placeholder="student@email.com"
              value={formData.email}
              onChange={handleInputChange('email')}
            />
            <label>Электронная почта</label>
          </div>

          <div className="input-field password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleInputChange('password')}
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

          <div className="input-field password-field">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Подтвердите пароль"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
            <label>Подтвердите пароль</label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span className="red-checkbox"></span>
              <span className="terms-text">
                Я даю согласие на <Link to="/terms">обработку персональных данных</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className={`auth-button ${!agreeTerms ? 'disabled' : ''}`}
            disabled={!agreeTerms}
          >
            Зарегистрироваться
          </button>
        </form>

        <div className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
}