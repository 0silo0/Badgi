import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthStyles.scss';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Пожалуйста, введите email');
      return;
    }

    try {

      
      //сюда надо прикрутить логику с отправкой сообщения с инструкциями на почту


      setSuccess('Инструкции по восстановлению отправлены на ваш email');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h2>Восстановление пароля</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              type="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>

          <button type="submit" className="auth-button">
            Отправить инструкции
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Вернуться к входу</Link>
        </div>
      </div>
    </div>
  );
}