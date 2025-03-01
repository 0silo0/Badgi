import { NavLink } from 'react-router-dom';
import { 
  FiMap,
  FiFileText, 
  FiCalendar,
  FiUser
} from 'react-icons/fi';
import './Navigation.scss';

export default function Navigation() {
  return (
    <nav className="navigation">
      <NavLink to="/" className={({ isActive }) => 
        `nav-item ${isActive ? 'active' : ''}`
      }>
        <FiMap className="nav-icon" />
      </NavLink>

      <NavLink to="/news" className={({ isActive }) => 
        `nav-item ${isActive ? 'active' : ''}`
      }>
        <FiFileText className="nav-icon" />
      </NavLink>

      <NavLink to="/calendar" className={({ isActive }) => 
        `nav-item ${isActive ? 'active' : ''}`
      }>
        <FiCalendar className="nav-icon" />
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => 
        `nav-item ${isActive ? 'active' : ''}`
      }>
        <FiUser className="nav-icon" />
      </NavLink>
    </nav>
  );
}