import { useState, useRef, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import apiClient from '../../../../api/client';
import { isAxiosError } from 'axios';
import './ForgotPasswordConfirm.scss';

export default function ForgotPasswordConfirm() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode !== '111111') {
      setError('Неверный код подтверждения');
      setStatus('error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (fullCode.length === 6) {
        navigate('../reset'); // Переход на сброс пароля
      } else {
        setError('Введите 6 цифр');
        setStatus('error');
      }
    }, 1000);

    // setIsLoading(true);
    // try {
    //   // await apiClient.post('/verify-reset-code', { code: fullCode });
    //   setStatus('success');
    //   navigate('../reset');
    // } catch (err) {
    //   setError('Ошибка при проверке кода');
    //   setStatus('error');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="confirm-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="glass-panel">
        <h2>Подтверждение кода</h2>
        <p className="step-info">Введите код из письма</p>

        <div className={`status-message ${status} ${status !== 'idle' ? 'visible' : ''}`}>
          {status === 'error' && error}
          {status === 'success' && '✓ Код подтвержден'}
        </div>

        <div className="code-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => {inputsRef.current[index] = el}}
              className={status === 'error' ? 'error' : ''}
              autoFocus={index === 0}
              disabled={status === 'success'}
            />
          ))}
        </div>

        <div className="button-group">
          <button
            className={`btn complete ${status === 'success' ? 'valid' : ''}`}
            onClick={handleVerify}
            disabled={code.join('').length !== 6 || isLoading}
          >
            {isLoading ? 'Проверка...' : 'Подтвердить'}
          </button>
        </div>

        <div className="resend-code">
          Не получили код?{' '}
          <button
            onClick={async () => {
              try {
                await apiClient.post('/resend-reset-code');
              } catch (err) {
                setError('Ошибка при отправке кода');
              }
            }}
          >
            Отправить повторно
          </button>
        </div>
      </div>
    </div>
  );
}