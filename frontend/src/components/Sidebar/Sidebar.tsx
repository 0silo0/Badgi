import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.scss';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Очистка токенов
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Принудительный переход
    navigate('/login', { replace: true });
    window.location.reload(); // Добавьте, если переход не работает
  };

  return (
    <div className="sidebar">
      <div className="nav-buttons">
        <button 
          className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          HomePage
        </button>
        
        <button 
          className="nav-button logout"
          onClick={handleLogout}
        >
          Выход
        </button>
      </div>
    </div>
  );
}