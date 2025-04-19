import { useState, useRef, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './newEmailConfirm.scss';

export default function NewEmailConfirm() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
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

  const handleVerify = () => {
    const fullCode = code.join('');
    const isValid = fullCode === '111111'; 

    if (isValid) {
      setStatus('success');
    } else {
      setStatus('error');
      setCode(Array(6).fill(''));
      inputsRef.current[0]?.focus();
    }
  };

  const handleComplete = () => {
    localStorage.removeItem('registrationData');
    navigate('/login', { replace: true });
  };

  return (
    <div className="confirm-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <div className="glass-panel">
        <h2>Подтверждение email</h2>
        <p className="step-info">Шаг 4 из 4</p>

        <div className={`status-message ${status} ${status !== 'idle' ? 'visible' : ''}`}>
            {status === 'error' && 'Неверный код подтверждения'}
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
              className={status === 'success' ? 'valid' : status === 'error' ? 'error' : ''}
              autoFocus={index === 0}
              disabled={status === 'success'}
            />
          ))}
        </div>

        <div className="button-group">
          <button
            className={`btn complete ${status === 'success' ? 'valid' : ''}`}
            onClick={status === 'success' ? handleComplete : handleVerify}
          >
            {status === 'success' ? 'Завершить регистрацию' : 'Подтвердить'}
          </button>
        </div>
      </div>
    </div>
  );
}