import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings, FiEdit, FiMail, FiHelpCircle, FiLogOut, FiBook, FiCalendar, FiUser, FiX, FiPaperclip , FiSmile } from 'react-icons/fi';
import './Profile.scss';

type UserStatus = 'student' | 'teacher' | 'guest';

const faculties = [
  'Биологический факультет',
  'Географический факультет',
  'Геологический факультет',
  'Историко-политологический факультет',
  'Институт компьютерных наук и технологий',
  'Факультет современных иностранных языков и литератур',
  'Физико-математический институт',
  'Философско-социологический факультет',
  'Филологический факультет',
  'Химический факультет',
  'Экономический факультет',
  'Юридический факультет'
];

const degrees = ['Бакалавр', 'Магистр', 'Аспирант'];
const positions = ['Профессор', 'Доцент', 'Старший преподаватель', 'Младший преподаватель', 'Ассистент'];
const courses = Array.from({length: 5}, (_, i) => `${i + 1}`);

type ProfileProps = {
  setIsAuthenticated: (value: boolean) => void;
};

export default function ProfilePage({ setIsAuthenticated }: ProfileProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    status: 'guest' as UserStatus,
    firstName: '',
    lastName: '',
    faculty: faculties[0],
    degree: degrees[0],
    department: '',
    position: positions[0],
    course: courses[3],
    direction: '',
    about: '',
    login: 'user_login', 
    email: 'user@email.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [feedbackData, setFeedbackData] = useState({
    subject: '',
    message: '',
    attachment: null as File | null
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMenu && !(e.target as Element).closest('.profile-menu, .settings-button')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const logoutUser = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      return response.json();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      if (localStorage.removeItem('token') !== undefined) {
        await logoutUser();
      }

      localStorage.removeItem('token');
      sessionStorage.removeItem('token');

      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      alert('Не удалось выйти из системы. Попробуйте снова.');
    }
  };

  const handleFAQClick = () => {
    navigate('/faq'); 
    setShowMenu(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }
    setIsEditing(false);
    setPasswordError('');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFeedback(false);
  };

  const MenuItem = ({ icon: Icon, text, onClick }: { 
    icon: React.ElementType,
    text: string,
    onClick: () => void
  }) => (
    <button className="menu-item" onClick={onClick}>
      <Icon className="menu-icon" />
      <span>{text}</span>
    </button>
  );

  const renderInfoSection = () => {
    switch(formData.status) {
      case 'student':
        return (
          <div className="info-section">
            <h2><FiBook />Учебные данные</h2>
            <div className="info-row">
              <span>Факультет:</span>
              <span>{formData.faculty}</span>
            </div>
            <div className="info-row">
              <span>Степень:</span>
              <span>{formData.degree}</span>
            </div>
            <div className="info-row">
              <span>Направление:</span>
              <span>{formData.direction}</span>
            </div>
            <div className="info-row">
              <span>Курс:</span>
              <span>{formData.course}</span>
            </div>
          </div>
        );
      case 'teacher':
        return (
          <div className="info-section">
            <h2><FiBook />Учебные данные</h2>
            <div className="info-row">
              <span>Кафедра:</span>
              <span>{formData.department}</span>
            </div>
            <div className="info-row">
              <span>Должность:</span>
              <span>{formData.position}</span>
            </div>
          </div>
        );
      case 'guest':
        return (
          <div className="info-section">
            <h2><FiSmile />Информация обо мне</h2>
            <div className="info-row">
              <span>Кто вы?</span>
              <span>{formData.about}</span>
            </div>
          </div>
        );
    }
  };

  const renderEditFields = () => {
    return (
      <>
        <div className="form-group">
          <label>Статус</label>
          <div className="select-wrapper">
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as UserStatus})}
              className="custom-select"
            >
              <option value="guest">Гость</option>
              <option value="student">Студент</option>
              <option value="teacher">Преподаватель</option>
            </select>
          </div>
        </div>

        {formData.status === 'student' && (
          <>
            <div className="form-group">
              <label>Факультет</label>
              <div className="select-wrapper">
                <select
                  value={formData.faculty}
                  onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                  className="custom-select"
                >
                  {faculties.map(faculty => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Степень</label>
                <div className="select-wrapper">
                  <select
                    value={formData.degree}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    className="custom-select"
                  >
                    {degrees.map(degree => (
                      <option key={degree} value={degree}>{degree}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Курс</label>
                <div className="select-wrapper">
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    className="custom-select"
                  >
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Направление</label>
              <input
                className="custom-input"
                value={formData.direction}
                onChange={(e) => setFormData({...formData, direction: e.target.value})}
              />
            </div>
          </>
        )}

        {formData.status === 'teacher' && (
          <>
            <div className="form-group">
              <label>Должность</label>
              <div className="select-wrapper">
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="custom-select"
                >
                  {positions.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Кафедра</label>
              <input
                className="custom-input"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                placeholder="Введите название кафедры"
              />
            </div>
          </>
        )}

        {formData.status === 'guest' && (
          <div className="form-group">
            <label>Кто вы?</label>
            <input
              className="custom-input"
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="custom-input"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Логин</label>
          <input
            className="custom-input"
            value={formData.login}
            onChange={(e) => setFormData({...formData, login: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Текущий пароль</label>
          <input
            type="password"
            className="custom-input"
            value={formData.currentPassword}
            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Новый пароль</label>
          <input
            type="password"
            className="custom-input"
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label>Подтвердите пароль</label>
          <input
            type="password"
            className="custom-input"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>
      </>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button 
          className="settings-button"
          onClick={() => setShowMenu(!showMenu)}
        >
          <FiSettings />
        </button>

        {showMenu && (
          <div className="profile-menu">
            <MenuItem
              icon={FiEdit}
              text="Редактировать профиль"
              onClick={() => {
                setIsEditing(true);
                setShowMenu(false);
              }}
            />
            <MenuItem
              icon={FiMail}
              text="Обратная связь"
              onClick={() => {
                setShowFeedback(true);
                setShowMenu(false);
              }}
            />
            <MenuItem
              icon={FiHelpCircle}
              text="FAQ"
              onClick={handleFAQClick} 
            />
            <MenuItem
              icon={FiLogOut}
              text="Выйти"
              onClick={handleLogout}
            />
          </div>
        )}
      </div>

      {showFeedback && (
        <div className="feedback-modal">
          <div className="feedback-content">
            <div className="feedback-header">
              <h2>Обратная связь</h2>
              <button className="close-btn" onClick={() => setShowFeedback(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Тема письма"
                  value={feedbackData.subject}
                  onChange={(e) => setFeedbackData({...feedbackData, subject: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group">
                <input
                  type="email"
                  placeholder="От кого"
                  value={formData.email}
                  readOnly
                  className="sender-input"
                />
              </div>

              <div className="input-group message-group">
                <textarea
                  placeholder="Ваше сообщение"
                  value={feedbackData.message}
                  onChange={(e) => setFeedbackData({...feedbackData, message: e.target.value})}
                  required
                />
              </div>

              <div className="file-upload-group">
                <label>
                  <FiPaperclip className="clip-icon" />
                  <span>Прикрепить файл</span>
                  <input
                    type="file"
                    onChange={(e) => setFeedbackData({...feedbackData, attachment: e.target.files?.[0] || null})}
                  />
                </label>
              </div>

              <button type="submit" className="submit-button">
                Отправить
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="profile-content">
        <div className="avatar-section">
          <label className="avatar-label">
            {avatar ? (
              <img src={avatar} className="avatar" alt="Аватар" />
            ) : (
              <div className="avatar-placeholder">
                {isEditing && <span>+</span>}
              </div>
            )}
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="avatar-input"
              />
            )}
          </label>
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Имя</label>
              <input
                className="custom-input"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Фамилия</label>
                <input
                  className="custom-input"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
            </div>

            {renderEditFields()}

            {passwordError && <div className="error-message">{passwordError}</div>}

            <div className="form-actions">
              <button type="submit" className="save-button">
                Сохранить изменения
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <h1 className="full-name">{formData.firstName + ' ' + formData.lastName}</h1>
            <p className="status">{formData.status === 'student' ? 'Студент' : 
              formData.status === 'teacher' ? 'Преподаватель' : 'Гость'}</p>

            {renderInfoSection()}

            <div className="info-section">
              <h2><FiUser />Контактная информация</h2>
              <div className="info-row">
                <span>Логин:</span>
                <span>{formData.login}</span>
              </div>
              <div className="info-row">
                <span>Email:</span>
                <span>{formData.email}</span>
              </div>
              <div className="info-row">
                <span><FiCalendar />Дата регистрации:</span>
                <span>01.09.2025</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}