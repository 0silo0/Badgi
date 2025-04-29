import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiCheck, FiEye, FiEyeOff, FiUpload, FiXCircle } from 'react-icons/fi';
import './EditProfileModal.scss';

interface UserData {
  name: string;
  login: string;
  email: string;
  avatar: string;
}

interface EditProfileModalProps {
  userData: UserData;
  onClose: () => void;
  onSave: (data: UserData, password?: string, newPassword?: string) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ userData, onClose, onSave }) => {
  const [formData, setFormData] = useState<UserData>({ ...userData });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailVerified, setEmailVerified] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmailVerified(formData.email === userData.email);
  }, [formData.email, userData.email]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, avatar: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    if (window.confirm('Вы уверены, что хотите удалить аватар?')) {
      setFormData({ ...formData, avatar: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.login.trim()) newErrors.login = 'Логин обязателен';
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    if (newPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const passwordData = newPassword ? {
      password: oldPassword,
      newPassword: newPassword
    } : undefined;

    onSave(formData, passwordData?.password, passwordData?.newPassword);
    onClose();
  };

  return (
    <div className="edit-profile-modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>

        <div className="avatar-section">
          <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
            {formData.avatar ? (
              <>
                <img src={formData.avatar} alt="Аватар" className="avatar" />
                <button className="remove-avatar" onClick={handleRemoveAvatar}>
                  <FiXCircle size={20} />
                </button>
              </>
            ) : (
              <div className="avatar-placeholder">
                <FiUpload size={32} />
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleAvatarChange}
            hidden
          />
        </div>

        <div className="form-group">
          <label>Фамилия</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Имя</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Логин</label>
          <input
            type="text"
            value={formData.login}
            onChange={(e) => setFormData({ ...formData, login: e.target.value })}
          />
          {errors.login && <span className="error">{errors.login}</span>}
        </div>

        <div className="form-group email-group">
          <label>Email</label>
          <div className="input-with-button">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {emailVerified ? (
              <FiCheck className="verified-icon" />
            ) : (
              <button
                className="verify-button"
                onClick={() => setEmailVerified(true)}
              >
                Подтвердить
              </button>
            )}
          </div>
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="password-section">
          <div className="form-group">
            <label>Старый пароль</label>
            <div className="password-input">
              <input
                type={showPasswords.old ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button
                onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
              >
                {showPasswords.old ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Новый пароль</label>
            <div className="password-input">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              >
                {showPasswords.new ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Подтвердите пароль</label>
            <div className="password-input">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              >
                {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>
        </div>

        <div className="action-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button className="save-btn" onClick={handleSave}>
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;