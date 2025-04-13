import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './AuthStyles.scss';

type TermsModalProps = {
  onClose: () => void;
  onConfirm: () => void;
  initialChecked: boolean;
};

export default function TermsModal({ onClose, onConfirm, initialChecked }: TermsModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(initialChecked);

  useEffect(() => {
    setIsConfirmed(initialChecked);
  }, [initialChecked]);

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="terms-modal-overlay">
      <div className="terms-modal">
        <div className="modal-header">
          <h1>Согласие на обработку персональных данных</h1>
          <button className="close-button" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="terms-content">
            <div className="terms-section">
              <h3>1. Общие положения</h3>
              <p>
                Настоящее согласие предоставляется в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ 
                «О персональных данных» и действует на всей территории Российской Федерации. Субъект персональных 
                данных подтверждает, что все предоставленные данные являются достоверными и актуальными.
              </p>
              <p>
                Согласие действует до момента его отзыва путем направления письменного уведомления 
                на официальный email платформы.
              </p>
            </div>

            <div className="terms-section">
              <h3>2. Цели обработки</h3>
              <p>
                Обработка персональных данных осуществляется для: регистрации пользователя в системе, выполнения юридических обязательств, анализа использования 
                сервиса и направления технических уведомлений.
              </p>
            </div>

            <div className="terms-section">
              <h3>3. Состав данных</h3>
              <p>
                Обрабатываемые данные включают: фамилию, имя, отчество; контактную информацию (e-mail); 
                данные об учебном процессе; технические данные.
              </p>
            </div>

            <div className="terms-section">
              <h3>4. Способы обработки</h3>
              <p>
                Обработка осуществляется автоматизированными средствами с применением современных технологий защиты. 
                Данные хранятся на защищенных серверах на территории РФ.
              </p>
            </div>

            <div className="terms-section">
              <h3>5. Права субъекта</h3>
              <p>
                Субъект данных имеет право: отозвать согласие, требовать уточнения данных, ограничивать обработку, 
                обжаловать действия оператора в установленном законом порядке.
              </p>
            </div>
          </div>

          <div className="confirmation-block">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
              />
              <span className="custom-checkbox"></span>
              <span className="terms-text">
                Я подтверждаю ознакомление со всеми пунктами соглашения
              </span>
            </label>

            <div className="buttons-container">
              <button 
                className="auth-button secondary"
                onClick={onClose}
              >
                Отмена
              </button>
              <button 
                className="auth-button primary"
                onClick={handleConfirm}
                disabled={!isConfirmed}
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export {};